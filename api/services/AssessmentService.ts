import db from '../db/index';
import { generatePersona } from './AIService';
import type { PersonaResult } from '../../shared/types';

function generateId(): string {
  return 'a_' + Math.random().toString(36).slice(2, 10);
}

export function createAssessment(userId: string): PersonaResult {
  const assessmentId = generateId();
  const persona = generatePersona(userId, assessmentId);

  const stmt = db.prepare(`
    INSERT INTO assessments (id, user_id, persona_title, persona_tags, persona_description)
    VALUES (?, ?, ?, ?, ?)
  `);
  stmt.run(
    assessmentId,
    userId,
    persona.title,
    JSON.stringify(persona.tags),
    persona.description
  );

  return getAssessment(assessmentId)!;
}

export function getAssessment(assessmentId: string): PersonaResult | null {
  const row = db.prepare(`
    SELECT id, user_id, persona_title, persona_tags, persona_description, created_at as createdAt
    FROM assessments WHERE id = ?
  `).get(assessmentId) as any;
  if (!row) return null;

  return {
    id: row.id,
    userId: row.user_id,
    title: row.persona_title,
    tags: JSON.parse(row.persona_tags),
    description: row.persona_description,
    createdAt: row.createdAt
  };
}

export function getRecentAssessment(userId: string, daysAgo: number = 7): PersonaResult | null {
  const row = db.prepare(`
    SELECT id, user_id, persona_title, persona_tags, persona_description, created_at as createdAt
    FROM assessments
    WHERE user_id = ? AND created_at >= datetime('now', ?)
    ORDER BY created_at DESC
    LIMIT 1
  `).get(userId, `-${daysAgo} days`) as any;

  if (!row) return null;
  return {
    id: row.id,
    userId: row.user_id,
    title: row.persona_title,
    tags: JSON.parse(row.persona_tags),
    description: row.persona_description,
    createdAt: row.createdAt
  };
}

export function getUserAssessments(userId: string): PersonaResult[] {
  const rows = db.prepare(`
    SELECT id, user_id, persona_title, persona_tags, persona_description, created_at as createdAt
    FROM assessments
    WHERE user_id = ?
    ORDER BY created_at DESC
  `).all(userId) as any[];

  return rows.map(row => ({
    id: row.id,
    userId: row.user_id,
    title: row.persona_title,
    tags: JSON.parse(row.persona_tags),
    description: row.persona_description,
    createdAt: row.createdAt
  }));
}
