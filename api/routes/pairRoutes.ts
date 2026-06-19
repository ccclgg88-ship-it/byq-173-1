import { Router } from 'express';
import {
  createPairInvite,
  getPairTask,
  joinPairTask,
  consentToReport,
  getDailyInviteCount,
  isReportPubliclyAccessible
} from '../services/PairService';

const router = Router();

router.get('/daily-count/:userId', (req, res) => {
  const count = getDailyInviteCount(req.params.userId);
  res.json({ count, maxCount: 5 });
});

router.post('/invite', (req, res) => {
  const { inviterId, inviterAssessmentId } = req.body;
  if (!inviterId || !inviterAssessmentId) {
    return res.status(400).json({ error: 'inviterId and inviterAssessmentId are required' });
  }
  try {
    const task = createPairInvite(inviterId, inviterAssessmentId);
    const origin = req.headers.origin || 'http://localhost:3034';
    res.json({
      taskId: task.id,
      inviteUrl: `${origin}/pair/join/${task.id}`,
      status: task.status,
      expiresAt: task.expiresAt
    });
  } catch (e: any) {
    if (e.message === 'DAILY_LIMIT_EXCEEDED') {
      return res.status(429).json({ error: 'Daily invite limit exceeded' });
    }
    res.status(500).json({ error: e.message });
  }
});

router.get('/tasks/:taskId', (req, res) => {
  const { userId } = req.query as { userId?: string };
  const task = getPairTask(req.params.taskId, userId);
  if (!task) {
    return res.status(404).json({ error: 'Task not found' });
  }

  if (task.status === 'READY') {
    const isParticipant =
      userId && (userId === task.inviter.id || userId === task.partner?.id);
    const isPublic = isReportPubliclyAccessible(task.id);

    if (!isParticipant && !isPublic) {
      return res.status(403).json({
        error: 'Report is private. Both participants must consent to make it public.',
        needsConsent: true
      });
    }
  }

  res.json(task);
});

router.post('/join', (req, res) => {
  const { taskId, nickname, avatar } = req.body;
  if (!taskId || !nickname) {
    return res.status(400).json({ error: 'taskId and nickname are required' });
  }
  try {
    const result = joinPairTask(taskId, nickname, avatar);
    res.json(result);
  } catch (e: any) {
    const statusMap: Record<string, number> = {
      TASK_NOT_FOUND: 404,
      TASK_EXPIRED: 410,
      TASK_ALREADY_JOINED: 409,
      CANNOT_JOIN_OWN_TASK: 400,
      ACTIVE_TASK_EXISTS: 409
    };
    res.status(statusMap[e.message] || 500).json({ error: e.message });
  }
});

router.post('/tasks/:taskId/consent', (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }
  try {
    const result = consentToReport(req.params.taskId, userId);
    res.json(result);
  } catch (e: any) {
    const statusMap: Record<string, number> = {
      TASK_NOT_FOUND: 404,
      NOT_AUTHORIZED: 403
    };
    res.status(statusMap[e.message] || 500).json({ error: e.message });
  }
});

export default router;
