const express = require('express');
const router = express.Router();
const { createGoal, getUserGoals, getGoalById, completeDay, submitQuiz } = require('../controllers/goalController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect); // All goal routes require auth

router.post('/create', createGoal);
router.get('/', getUserGoals);
router.get('/:goalId', getGoalById);
router.put('/days/:dayId/complete', completeDay);
router.post('/days/:dayId/quiz', submitQuiz);

module.exports = router;
