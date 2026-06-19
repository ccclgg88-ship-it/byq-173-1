import { Router } from 'express';
import { generateShareLink, recordReferral } from '../services/ShareService';

const router = Router();

router.post('/generate', async (req, res) => {
  const { userId, assessmentId } = req.body;
  if (!userId || !assessmentId) {
    return res.status(400).json({ error: 'userId and assessmentId are required' });
  }
  const origin = req.headers.origin || 'http://localhost:3034';
  const result = await generateShareLink(userId, assessmentId, origin);
  res.json(result);
});

router.post('/record-referral', (req, res) => {
  const { sharerId, assessmentId, newUserId } = req.body;
  if (!sharerId || !assessmentId || !newUserId) {
    return res.status(400).json({ error: 'sharerId, assessmentId, newUserId are required' });
  }
  const result = recordReferral(sharerId, assessmentId, newUserId);
  res.json(result);
});

export default router;
