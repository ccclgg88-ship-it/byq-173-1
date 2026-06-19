import db from '../db/index';
import { getUser, createUser } from './UserService';
import {
  getAssessment,
  createAssessment,
  getRecentAssessment
} from './AssessmentService';
import { generateCompatibilityReport } from './AIService';
import type {
  PairStatus,
  PairTaskDetail,
  PersonaResult,
  CompatibilityReport
} from '../../shared/types';

const MAX_DAILY_INVITES = 5;
const TASK_TTL_HOURS = 24;

function generateId(): string {
  return 'p_' + Math.random().toString(36).slice(2, 12);
}

function checkTaskExpired(task: any): boolean {
  if (task.status === 'EXPIRED') return true;
  const expiresAt = new Date(task.expires_at).getTime();
  return Date.now() > expiresAt;
}

function markExpiredIfNeeded(taskId: string): void {
  db.prepare(`
    UPDATE pair_tasks SET status = 'EXPIRED'
    WHERE id = ? AND status != 'EXPIRED' AND expires_at < datetime('now')
  `).run(taskId);
}

function formatTaskDetail(task: any): PairTaskDetail {
  markExpiredIfNeeded(task.id);
  const freshTask = db.prepare('SELECT * FROM pair_tasks WHERE id = ?').get(task.id) as any;

  const inviter = getUser(freshTask.inviter_id)!;
  const partner = freshTask.partner_id ? getUser(freshTask.partner_id) : undefined;

  const inviterAssessment = freshTask.inviter_assessment_id
    ? getAssessment(freshTask.inviter_assessment_id)
    : undefined;
  const partnerAssessment = freshTask.partner_assessment_id
    ? getAssessment(freshTask.partner_assessment_id)
    : undefined;

  let compatibilityReport: CompatibilityReport | undefined;
  if (freshTask.compatibility_score !== null) {
    compatibilityReport = {
      score: freshTask.compatibility_score,
      relationshipType: freshTask.relationship_type,
      commonTags: JSON.parse(freshTask.common_tags || '[]'),
      conflictTags: JSON.parse(freshTask.conflict_tags || '[]'),
      description: freshTask.report_description || ''
    };
  }

  return {
    id: freshTask.id,
    status: freshTask.status as PairStatus,
    inviter: { id: inviter.id, nickname: inviter.nickname, avatar: inviter.avatar },
    partner: partner ? { id: partner.id, nickname: partner.nickname, avatar: partner.avatar } : undefined,
    inviterAssessment,
    partnerAssessment,
    compatibilityReport,
    expiresAt: freshTask.expires_at,
    createdAt: freshTask.created_at,
    inviterConsented: !!freshTask.inviter_consented,
    partnerConsented: !!freshTask.partner_consented
  };
}

export function getDailyInviteCount(userId: string): number {
  const row = db.prepare(`
    SELECT COUNT(*) as count
    FROM pair_tasks
    WHERE inviter_id = ?
      AND date(created_at) = date('now')
  `).get(userId) as any;
  return row.count || 0;
}

export function hasActiveTaskBetween(inviterId: string, partnerId: string): boolean {
  const row = db.prepare(`
    SELECT id FROM pair_tasks
    WHERE ((inviter_id = ? AND partner_id = ?)
       OR (inviter_id = ? AND partner_id = ?))
      AND status IN ('WAITING_PARTNER', 'GENERATING', 'READY')
    LIMIT 1
  `).get(inviterId, partnerId, partnerId, inviterId);
  return !!row;
}

export function createPairInvite(inviterId: string, inviterAssessmentId: string): PairTaskDetail {
  const dailyCount = getDailyInviteCount(inviterId);
  if (dailyCount >= MAX_DAILY_INVITES) {
    throw new Error('DAILY_LIMIT_EXCEEDED');
  }

  const taskId = generateId();
  const expiresAt = new Date(Date.now() + TASK_TTL_HOURS * 60 * 60 * 1000).toISOString();

  db.prepare(`
    INSERT INTO pair_tasks (id, inviter_id, inviter_assessment_id, status, expires_at)
    VALUES (?, ?, ?, 'WAITING_PARTNER', ?)
  `).run(taskId, inviterId, inviterAssessmentId, expiresAt);

  const task = db.prepare('SELECT * FROM pair_tasks WHERE id = ?').get(taskId) as any;
  return formatTaskDetail(task);
}

export function getPairTask(taskId: string, _userId?: string): PairTaskDetail | null {
  const task = db.prepare('SELECT * FROM pair_tasks WHERE id = ?').get(taskId) as any;
  if (!task) return null;
  return formatTaskDetail(task);
}

export function joinPairTask(
  taskId: string,
  nickname: string,
  avatar?: string
): { taskId: string; status: PairStatus; partnerId: string } {
  const task = db.prepare('SELECT * FROM pair_tasks WHERE id = ?').get(taskId) as any;
  if (!task) throw new Error('TASK_NOT_FOUND');

  markExpiredIfNeeded(taskId);
  const freshTask = db.prepare('SELECT * FROM pair_tasks WHERE id = ?').get(taskId) as any;
  if (freshTask.status === 'EXPIRED') throw new Error('TASK_EXPIRED');
  if (freshTask.status !== 'WAITING_PARTNER') throw new Error('TASK_ALREADY_JOINED');

  const partner = createUser(nickname, avatar);

  if (freshTask.inviter_id === partner.id) {
    throw new Error('CANNOT_JOIN_OWN_TASK');
  }

  if (hasActiveTaskBetween(freshTask.inviter_id, partner.id)) {
    throw new Error('ACTIVE_TASK_EXISTS');
  }

  const recentAssessment = getRecentAssessment(partner.id, 7);
  const partnerAssessment = recentAssessment || createAssessment(partner.id);

  let partnerAssessmentId = partnerAssessment.id;
  let status: PairStatus = 'GENERATING';

  db.prepare(`
    UPDATE pair_tasks
    SET partner_id = ?, partner_assessment_id = ?, status = ?
    WHERE id = ?
  `).run(partner.id, partnerAssessmentId, status, taskId);

  setTimeout(() => {
    process.nextTick(() => {
      try {
        generateFinalReport(taskId);
      } catch (e) {
        console.error('Error generating pair report:', e);
      }
    });
  }, 500);

  return { taskId, status: 'GENERATING', partnerId: partner.id };
}

export function generateFinalReport(taskId: string): void {
  const task = db.prepare('SELECT * FROM pair_tasks WHERE id = ?').get(taskId) as any;
  if (!task || !task.inviter_assessment_id || !task.partner_assessment_id) return;

  const inviterAssessment = getAssessment(task.inviter_assessment_id);
  const partnerAssessment = getAssessment(task.partner_assessment_id);
  if (!inviterAssessment || !partnerAssessment) return;

  const report = generateCompatibilityReport(inviterAssessment, partnerAssessment);

  db.prepare(`
    UPDATE pair_tasks
    SET status = 'READY',
        compatibility_score = ?,
        relationship_type = ?,
        common_tags = ?,
        conflict_tags = ?,
        report_description = ?
    WHERE id = ?
  `).run(
    report.score,
    report.relationshipType,
    JSON.stringify(report.commonTags),
    JSON.stringify(report.conflictTags),
    report.description,
    taskId
  );
}

export function consentToReport(taskId: string, userId: string): { taskId: string; bothConsented: boolean } {
  const task = db.prepare('SELECT * FROM pair_tasks WHERE id = ?').get(taskId) as any;
  if (!task) throw new Error('TASK_NOT_FOUND');

  const isInviter = task.inviter_id === userId;
  const isPartner = task.partner_id === userId;
  if (!isInviter && !isPartner) throw new Error('NOT_AUTHORIZED');

  if (isInviter) {
    db.prepare('UPDATE pair_tasks SET inviter_consented = 1 WHERE id = ?').run(taskId);
  } else {
    db.prepare('UPDATE pair_tasks SET partner_consented = 1 WHERE id = ?').run(taskId);
  }

  const updated = db.prepare('SELECT * FROM pair_tasks WHERE id = ?').get(taskId) as any;
  const bothConsented = !!updated.inviter_consented && !!updated.partner_consented;

  return { taskId, bothConsented };
}

export function isReportPubliclyAccessible(taskId: string): boolean {
  const task = db.prepare(
    'SELECT inviter_consented, partner_consented FROM pair_tasks WHERE id = ?'
  ).get(taskId) as any;
  if (!task) return false;
  return !!task.inviter_consented && !!task.partner_consented;
}
