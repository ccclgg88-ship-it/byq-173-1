import db from '../db/index';
import { generateAnonymousTitle } from './AIService';
import type { User, ShareStats } from '../../shared/types';

function generateId(): string {
  return 'u_' + Math.random().toString(36).slice(2, 10);
}

const AVATAR_POOL = ['🦊', '🐱', '🐶', '🐼', '🦄', '🐨', '🐯', '🦁', '🐸', '🐙', '🦋', '🌟'];

export function createUser(nickname: string, avatar?: string): User {
  const id = generateId();
  const finalAvatar = avatar || AVATAR_POOL[Math.floor(Math.random() * AVATAR_POOL.length)];
  const stmt = db.prepare(`
    INSERT INTO users (id, nickname, avatar)
    VALUES (?, ?, ?)
  `);
  stmt.run(id, nickname, finalAvatar);
  return getUser(id)!;
}

export function getUser(userId: string): User | null {
  const row = db.prepare(`
    SELECT id, nickname, avatar, created_at as createdAt
    FROM users WHERE id = ?
  `).get(userId) as any;
  if (!row) return null;
  return {
    id: row.id,
    nickname: row.nickname,
    avatar: row.avatar,
    createdAt: row.createdAt
  };
}

export function getShareStats(userId: string): ShareStats {
  const countRow = db.prepare(`
    SELECT COUNT(*) as count FROM referrals WHERE sharer_id = ?
  `).get(userId) as any;

  const recentRows = db.prepare(`
    SELECT r.invitee_id as id, u.nickname
    FROM referrals r
    JOIN users u ON r.invitee_id = u.id
    WHERE r.sharer_id = ?
    ORDER BY r.created_at DESC
    LIMIT 5
  `).all(userId) as any[];

  const recentFriends = recentRows.map(row => ({
    id: row.id,
    anonymousTitle: generateAnonymousTitle()
  }));

  return {
    totalInvites: countRow.count || 0,
    recentFriends
  };
}
