import { Router } from 'express';
import {
  createAssessment,
  getAssessment,
  getUserAssessments,
  checkRecentDuplicate
} from '../services/AssessmentService';
import { getQuizQuestions } from '../services/AIService';
import type { ThemeId } from '../../shared/types';

const VALID_THEMES: ThemeId[] = ['social', 'love', 'career'];

const router = Router();

router.get('/questions', (req, res) => {
  const theme = (req.query.theme as ThemeId) || 'social';
  if (!VALID_THEMES.includes(theme)) {
    return res.status(400).json({ error: 'Invalid theme' });
  }
  res.json(getQuizQuestions(theme));
});

router.post('/', (req, res) => {
  const { userId, theme } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }
  const finalTheme: ThemeId = VALID_THEMES.includes(theme) ? theme : 'social';
  const assessment = createAssessment(userId, finalTheme);
  const duplicate = checkRecentDuplicate(userId, finalTheme);
  res.json({ ...assessment, duplicateCheck: duplicate });
});

router.get('/duplicate-check', (req, res) => {
  const { userId, theme } = req.query as { userId?: string; theme?: string };
  if (!userId || !theme) {
    return res.status(400).json({ error: 'userId and theme are required' });
  }
  if (!VALID_THEMES.includes(theme as ThemeId)) {
    return res.status(400).json({ error: 'Invalid theme' });
  }
  const result = checkRecentDuplicate(userId, theme as ThemeId);
  res.json(result);
});

router.get('/user/:userId', (req, res) => {
  const theme = req.query.theme as ThemeId | undefined;
  const assessments = getUserAssessments(req.params.userId, theme);
  res.json(assessments);
});

router.get('/:id', (req, res) => {
  const assessment = getAssessment(req.params.id);
  if (!assessment) {
    return res.status(404).json({ error: 'Assessment not found' });
  }
  res.json(assessment);
});

export default router;
