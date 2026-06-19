import { Router } from 'express';
import {
  createAssessment,
  getAssessment,
  getUserAssessments
} from '../services/AssessmentService';
import { QUIZ_QUESTIONS } from '../services/AIService';

const router = Router();

router.get('/questions', (_req, res) => {
  res.json(QUIZ_QUESTIONS);
});

router.post('/', (req, res) => {
  const { userId } = req.body;
  if (!userId) {
    return res.status(400).json({ error: 'userId is required' });
  }
  const assessment = createAssessment(userId);
  res.json(assessment);
});

router.get('/:id', (req, res) => {
  const assessment = getAssessment(req.params.id);
  if (!assessment) {
    return res.status(404).json({ error: 'Assessment not found' });
  }
  res.json(assessment);
});

router.get('/user/:userId', (req, res) => {
  const assessments = getUserAssessments(req.params.userId);
  res.json(assessments);
});

export default router;
