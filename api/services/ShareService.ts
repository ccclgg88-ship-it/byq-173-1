import QRCode from 'qrcode';
import db from '../db/index';
import type { ShareGenerateResult, ReferralRecordResult } from '../../shared/types';

function generateId(): string {
  return 'r_' + Math.random().toString(36).slice(2, 10);
}

export async function generateShareLink(
  userId: string,
  assessmentId: string,
  baseUrl: string = 'http://localhost:3034'
): Promise<ShareGenerateResult> {
  const shareUrl = `${baseUrl}/share/${userId}/${assessmentId}?utm_source=app`;
  const qrCodeDataUrl = await QRCode.toDataURL(shareUrl, {
    width: 200,
    margin: 2,
    color: {
      dark: '#6366F1',
      light: '#FFFFFF'
    }
  });

  return {
    shareUrl,
    qrCodeDataUrl
  };
}

export function recordReferral(
  sharerId: string,
  assessmentId: string,
  newUserId: string
): ReferralRecordResult {
  if (sharerId === newUserId) {
    return { counted: false, reason: 'self_share' };
  }

  const existing = db.prepare(`
    SELECT id FROM referrals WHERE sharer_id = ? AND invitee_id = ?
  `).get(sharerId, newUserId);

  if (existing) {
    return { counted: false, reason: 'already_referred' };
  }

  const id = generateId();
  const stmt = db.prepare(`
    INSERT INTO referrals (id, sharer_id, invitee_id, source_assessment_id)
    VALUES (?, ?, ?, ?)
  `);

  try {
    stmt.run(id, sharerId, newUserId, assessmentId);
    return { counted: true };
  } catch (e) {
    return { counted: false, reason: 'database_error' };
  }
}
