import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbDir = path.resolve(__dirname, '../../data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbPath = path.join(dbDir, 'app.db');
const db = new Database(dbPath);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function initDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      nickname TEXT NOT NULL,
      avatar TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS assessments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL REFERENCES users(id),
      persona_title TEXT NOT NULL,
      persona_tags TEXT NOT NULL,
      persona_description TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_assessments_user_id ON assessments(user_id);
    CREATE INDEX IF NOT EXISTS idx_assessments_created_at ON assessments(created_at);

    CREATE TABLE IF NOT EXISTS referrals (
      id TEXT PRIMARY KEY,
      sharer_id TEXT NOT NULL REFERENCES users(id),
      invitee_id TEXT NOT NULL REFERENCES users(id),
      source_assessment_id TEXT REFERENCES assessments(id),
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(sharer_id, invitee_id)
    );
    CREATE INDEX IF NOT EXISTS idx_referrals_sharer_id ON referrals(sharer_id);

    CREATE TABLE IF NOT EXISTS pair_tasks (
      id TEXT PRIMARY KEY,
      inviter_id TEXT NOT NULL REFERENCES users(id),
      partner_id TEXT REFERENCES users(id),
      inviter_assessment_id TEXT NOT NULL REFERENCES assessments(id),
      partner_assessment_id TEXT REFERENCES assessments(id),
      status TEXT NOT NULL DEFAULT 'WAITING_PARTNER',
      compatibility_score INTEGER,
      relationship_type TEXT,
      common_tags TEXT,
      conflict_tags TEXT,
      report_description TEXT,
      inviter_consented INTEGER DEFAULT 0,
      partner_consented INTEGER DEFAULT 0,
      expires_at DATETIME NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_pair_tasks_inviter ON pair_tasks(inviter_id);
    CREATE INDEX IF NOT EXISTS idx_pair_tasks_partner ON pair_tasks(partner_id);
    CREATE INDEX IF NOT EXISTS idx_pair_tasks_status ON pair_tasks(status);
    CREATE INDEX IF NOT EXISTS idx_pair_tasks_expires ON pair_tasks(expires_at);
  `);
}

export default db;
