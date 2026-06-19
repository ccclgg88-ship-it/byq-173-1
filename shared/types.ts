export type PairStatus =
  | 'WAITING_PARTNER'
  | 'GENERATING'
  | 'READY'
  | 'EXPIRED';

export interface User {
  id: string;
  nickname: string;
  avatar: string;
  createdAt: string;
}

export interface PersonaResult {
  id: string;
  userId: string;
  title: string;
  tags: string[];
  description: string;
  createdAt: string;
}

export interface CompatibilityReport {
  score: number;
  relationshipType: string;
  commonTags: string[];
  conflictTags: string[];
  description: string;
}

export interface PairTaskDetail {
  id: string;
  status: PairStatus;
  inviter: { id: string; nickname: string; avatar: string };
  partner?: { id: string; nickname: string; avatar: string };
  inviterAssessment?: PersonaResult;
  partnerAssessment?: PersonaResult;
  compatibilityReport?: CompatibilityReport;
  expiresAt: string;
  createdAt: string;
  inviterConsented: boolean;
  partnerConsented: boolean;
}

export interface ShareStats {
  totalInvites: number;
  recentFriends: Array<{ id: string; anonymousTitle: string }>;
}

export interface ShareGenerateResult {
  shareUrl: string;
  qrCodeDataUrl: string;
}

export interface ReferralRecordResult {
  counted: boolean;
  reason?: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
}
