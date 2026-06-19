export type PairStatus =
  | 'WAITING_PARTNER'
  | 'GENERATING'
  | 'READY'
  | 'EXPIRED';

export type ThemeId = 'social' | 'love' | 'career';

export interface ThemeInfo {
  id: ThemeId;
  name: string;
  icon: string;
  description: string;
  estimatedMinutes: number;
  coverGradient: string;
}

export const THEMES: ThemeInfo[] = [
  {
    id: 'social',
    name: '社交人设',
    icon: '🎉',
    description: '你在朋友圈里是什么角色？测测你的社交DNA',
    estimatedMinutes: 2,
    coverGradient: 'linear-gradient(135deg, #6366F1 0%, #EC4899 100%)'
  },
  {
    id: 'love',
    name: '恋爱人设',
    icon: '💕',
    description: '你在感情中是什么类型？解锁你的恋爱人格',
    estimatedMinutes: 2,
    coverGradient: 'linear-gradient(135deg, #EC4899 0%, #F59E0B 100%)'
  },
  {
    id: 'career',
    name: '职场人设',
    icon: '💼',
    description: '你在职场中是什么风格？发现你的工作灵魂',
    estimatedMinutes: 2,
    coverGradient: 'linear-gradient(135deg, #3B82F6 0%, #6366F1 100%)'
  }
];

export interface User {
  id: string;
  nickname: string;
  avatar: string;
  createdAt: string;
}

export interface PersonaResult {
  id: string;
  userId: string;
  theme: ThemeId;
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

export interface RecentDuplicateCheck {
  isDuplicate: boolean;
  lastTitle?: string;
  sameTitle: boolean;
  lastCreatedAt?: string;
}
