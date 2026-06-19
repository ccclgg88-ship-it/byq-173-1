import type {
  User,
  PersonaResult,
  ShareStats,
  ShareGenerateResult,
  ReferralRecordResult,
  PairTaskDetail,
  QuizQuestion,
  ThemeId,
  RecentDuplicateCheck
} from '../../shared/types';

const API_BASE = '/api';

async function request<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options?.headers || {})
    }
  });
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Request failed: ${res.status}`);
  }
  return data;
}

export const userApi = {
  create: (nickname: string, avatar?: string) =>
    request<User>('/users', {
      method: 'POST',
      body: JSON.stringify({ nickname, avatar })
    }),
  get: (id: string) => request<User>(`/users/${id}`),
  getShareStats: (id: string) => request<ShareStats>(`/users/${id}/share-stats`)
};

export const assessmentApi = {
  getQuestions: (theme: ThemeId) => request<QuizQuestion[]>(`/assessments/questions?theme=${theme}`),
  create: (userId: string, theme: ThemeId) =>
    request<PersonaResult & { duplicateCheck: RecentDuplicateCheck }>('/assessments', {
      method: 'POST',
      body: JSON.stringify({ userId, theme })
    }),
  get: (id: string) => request<PersonaResult>(`/assessments/${id}`),
  getByUser: (userId: string, theme?: ThemeId) =>
    request<PersonaResult[]>(`/assessments/user/${userId}${theme ? `?theme=${theme}` : ''}`),
  checkDuplicate: (userId: string, theme: ThemeId) =>
    request<RecentDuplicateCheck>(`/assessments/duplicate-check?userId=${encodeURIComponent(userId)}&theme=${theme}`)
};

export const shareApi = {
  generate: (userId: string, assessmentId: string) =>
    request<ShareGenerateResult>('/share/generate', {
      method: 'POST',
      body: JSON.stringify({ userId, assessmentId })
    }),
  recordReferral: (sharerId: string, assessmentId: string, newUserId: string) =>
    request<ReferralRecordResult>('/share/record-referral', {
      method: 'POST',
      body: JSON.stringify({ sharerId, assessmentId, newUserId })
    })
};

export const pairApi = {
  getDailyCount: (userId: string) =>
    request<{ count: number; maxCount: number }>(`/pair/daily-count/${userId}`),
  invite: (inviterId: string, inviterAssessmentId: string) =>
    request<{ taskId: string; inviteUrl: string; status: string; expiresAt: string }>(
      '/pair/invite',
      {
        method: 'POST',
        body: JSON.stringify({ inviterId, inviterAssessmentId })
      }
    ),
  getTask: (taskId: string, userId?: string) =>
    request<PairTaskDetail>(
      `/pair/tasks/${taskId}${userId ? `?userId=${encodeURIComponent(userId)}` : ''}`
    ),
  join: (taskId: string, nickname: string, avatar?: string, userId?: string) =>
    request<{ taskId: string; status: string; partnerId: string; isNewUser: boolean }>('/pair/join', {
      method: 'POST',
      body: JSON.stringify({ taskId, nickname, avatar, userId })
    }),
  consent: (taskId: string, userId: string) =>
    request<{ taskId: string; bothConsented: boolean }>(`/pair/tasks/${taskId}/consent`, {
      method: 'POST',
      body: JSON.stringify({ userId })
    })
};
