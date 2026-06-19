import { Router } from 'express';
import { createUser, getUser, getShareStats } from '../services/UserService';

const router = Router();

router.post('/', (req, res) => {
  const { nickname, avatar } = req.body;
  if (!nickname) {
    return res.status(400).json({ error: 'nickname is required' });
  }
  const user = createUser(nickname, avatar);
  res.json(user);
});

router.get('/:id', (req, res) => {
  const user = getUser(req.params.id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }
  res.json(user);
});

router.get('/:id/share-stats', (req, res) => {
  const stats = getShareStats(req.params.id);
  res.json(stats);
});

export default router;
