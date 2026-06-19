import db from '../db/index';
import { generatePersona } from './AIService';
import type { PersonaResult, ThemeId, RecentDuplicateCheck } from '../../shared/types';

function generateId(): string {
  return 'a_' + Math.random().toString(36).slice(2, 10);
}

export function createAssessment(userId: string, theme: ThemeId): PersonaResult {
  const assessmentId = generateId();
  const persona = generatePersona(userId, assessmentId, theme);

  const stmt = db.prepare(`
    INSERT INTO assessments (id, user_id, theme, persona_title, persona_tags, persona_description)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  stmt.run(
    assessmentId,
    userId,
    theme,
    persona.title,
    JSON.stringify(persona.tags),
    persona.description
  );

  return getAssessment(assessmentId)!;
}

export function getAssessment(assessmentId: string): PersonaResult | null {
  const row = db.prepare(`
    SELECT id, user_id, theme, persona_title, persona_tags, persona_description, created_at as createdAt
    FROM assessments WHERE id = ?
  `).get(assessmentId) as any;
  if (!row) return null;

  return {
    id: row.id,
    userId: row.user_id,
    theme: row.theme || 'social',
    title: row.persona_title,
    tags: JSON.parse(row.persona_tags),
    description: row.persona_description,
    createdAt: row.createdAt
  };
}

export function getRecentAssessment(userId: string, daysAgo: number = 7): PersonaResult | null {
  const row = db.prepare(`
    SELECT id, user_id, theme, persona_title, persona_tags, persona_description, created_at as createdAt
    FROM assessments
    WHERE user_id = ? AND created_at >= datetime('now', ?)
    ORDER BY created_at DESC
    LIMIT 1
  `).get(userId, `-${daysAgo} days`) as any;

  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    theme: row.theme || 'social',
    title: row.persona_title,
    tags: JSON.parse(row.persona_tags),
    description: row.persona_description,
    createdAt: row.createdAt
  };
}

export function getUserAssessments(userId: string, theme?: ThemeId): PersonaResult[] {
  let query = `
    SELECT id, user_id, theme, persona_title, persona_tags, persona_description, created_at as createdAt
    FROM assessments
    WHERE user_id = ?
  `;
  const params: any[] = [userId];

  if (theme) {
    query += ` AND theme = ?`;
    params.push(theme);
  }

  query += ` ORDER BY created_at DESC`;

  const rows = db.prepare(query).all(...params) as any[];

  return rows.map(row => ({
    id: row.id,
    userId: row.user_id,
    theme: row.theme || 'social',
    title: row.persona_title,
    tags: JSON.parse(row.persona_tags),
    description: row.persona_description,
    createdAt: row.createdAt
  }));
}

export function checkRecentDuplicate(userId: string, theme: ThemeId): RecentDuplicateCheck {
  const row = db.prepare(`
    SELECT id, persona_title, created_at as createdAt
    FROM assessments
    WHERE user_id = ? AND theme = ? AND created_at >= datetime('now', '-1 day')
    ORDER BY created_at DESC
    LIMIT 1
  `).get(userId, theme) as any;

  if (!row) {
    return { isDuplicate: false, sameTitle: false };
  }

  return {
    isDuplicate: true,
    lastTitle: row.persona_title,
    sameTitle: false,
    lastCreatedAt: row.createdAt
  };
}
