const Goal = require('../models/Goal');
const Day = require('../models/Day');
const User = require('../models/User');

// Helper: update streak
const updateStreak = async (user) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (!user.lastActivityDate) {
    user.streak = 1;
    user.lastActivityDate = today;
    return;
  }

  const lastActivity = new Date(user.lastActivityDate);
  lastActivity.setHours(0, 0, 0, 0);

  const diffMs = today - lastActivity;
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) {
    // Already updated today
    return;
  } else if (diffDays === 1) {
    // Consecutive day
    user.streak += 1;
    user.lastActivityDate = today;
  } else {
    // Streak broken
    user.streak = 1;
    user.lastActivityDate = today;
  }
};

// POST /api/goals/create
const createGoal = async (req, res) => {
  try {
    const { title, durationDays, difficulty, dailyTimeMinutes, roadmap } = req.body;

    if (!title || !durationDays || !roadmap) {
      return res.status(400).json({ message: 'Title, duration, and roadmap are required.' });
    }

    if (!Array.isArray(roadmap) || roadmap.length === 0) {
      return res.status(400).json({ message: 'Invalid roadmap data.' });
    }

    // Create goal
    const goal = await Goal.create({
      userId: req.user._id,
      title,
      durationDays,
      difficulty: difficulty || 'Intermediate',
      dailyTimeMinutes: dailyTimeMinutes || 60,
      progressPercentage: 0
    });

    // Create day documents from roadmap
    const dayDocs = roadmap.map((day) => ({
      goalId: goal._id,
      dayNumber: day.day,
      title: day.title,
      topics: day.topics || [],
      task: day.task || '',
      estimatedTimeMinutes: day.estimated_time_minutes || 60,
      quiz: (day.quiz || []).map(q => ({
        question: q.question,
        options: q.options,
        answer: q.answer
      })),
      completed: false,
      xpAwarded: false,
      quizXpAwarded: false
    }));

    await Day.insertMany(dayDocs);

    res.status(201).json({
      message: 'Goal created successfully.',
      goal: {
        id: goal._id,
        title: goal.title,
        durationDays: goal.durationDays,
        difficulty: goal.difficulty,
        progressPercentage: 0
      }
    });
  } catch (error) {
    console.error('Create goal error:', error);
    res.status(500).json({ message: 'Server error while creating goal.' });
  }
};

// GET /api/goals
const getUserGoals = async (req, res) => {
  try {
    const goals = await Goal.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.status(200).json(goals);
  } catch (error) {
    console.error('Get goals error:', error);
    res.status(500).json({ message: 'Server error while fetching goals.' });
  }
};

// GET /api/goals/:goalId
const getGoalById = async (req, res) => {
  try {
    const goal = await Goal.findOne({ _id: req.params.goalId, userId: req.user._id });

    if (!goal) {
      return res.status(404).json({ message: 'Goal not found.' });
    }

    const days = await Day.find({ goalId: goal._id }).sort({ dayNumber: 1 });

    res.status(200).json({ goal, days });
  } catch (error) {
    console.error('Get goal error:', error);
    res.status(500).json({ message: 'Server error while fetching goal.' });
  }
};

// PUT /api/days/:dayId/complete
const completeDay = async (req, res) => {
  try {
    const day = await Day.findById(req.params.dayId);
    if (!day) {
      return res.status(404).json({ message: 'Day not found.' });
    }

    const goal = await Goal.findOne({ _id: day.goalId, userId: req.user._id });
    if (!goal) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    const user = await User.findById(req.user._id);
    let xpGained = 0;

    // Mark day complete
    if (!day.completed) {
      day.completed = true;
      day.completedAt = new Date();
      await day.save();
    }

    // Award XP only once per day
    if (!day.xpAwarded) {
      day.xpAwarded = true;
      await day.save();
      user.xp += 10;
      xpGained += 10;
      await updateStreak(user);
    }

    // Recalculate goal progress
    const allDays = await Day.find({ goalId: goal._id });
    const completedCount = allDays.filter(d => d.completed).length;
    goal.progressPercentage = Math.round((completedCount / goal.durationDays) * 100);

    // Check if goal is completed
    if (completedCount === goal.durationDays && !goal.completed) {
      goal.completed = true;
      if (!goal.xpRewarded) {
        goal.xpRewarded = true;
        user.xp += 50;
        xpGained += 50;
      }
    }

    await goal.save();
    user.league = user.calculateLeague();
    await user.save();

    res.status(200).json({
      message: 'Day completed.',
      xpGained,
      progressPercentage: goal.progressPercentage,
      goalCompleted: goal.completed,
      userXp: user.xp,
      userLeague: user.league,
      userStreak: user.streak
    });
  } catch (error) {
    console.error('Complete day error:', error);
    res.status(500).json({ message: 'Server error while completing day.' });
  }
};

// POST /api/days/:dayId/quiz
const submitQuiz = async (req, res) => {
  try {
    const { answers } = req.body; // Array of { questionIndex, selectedAnswer }

    const day = await Day.findById(req.params.dayId);
    if (!day) {
      return res.status(404).json({ message: 'Day not found.' });
    }

    const goal = await Goal.findOne({ _id: day.goalId, userId: req.user._id });
    if (!goal) {
      return res.status(403).json({ message: 'Not authorized.' });
    }

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: 'Answers are required.' });
    }

    // Score quiz
    let correct = 0;
    const results = day.quiz.map((q, i) => {
      const userAnswer = answers[i]?.selectedAnswer || '';
      const isCorrect = userAnswer.trim().toLowerCase() === q.answer.trim().toLowerCase();
      if (isCorrect) correct++;
      return { question: q.question, userAnswer, correctAnswer: q.answer, isCorrect };
    });

    const score = Math.round((correct / day.quiz.length) * 100);
    const passed = score >= 70;

    let xpGained = 0;
    const user = await User.findById(req.user._id);

    // Award quiz XP only once
    if (passed && !day.quizXpAwarded) {
      day.quizXpAwarded = true;
      await day.save();
      user.xp += 5;
      xpGained = 5;
      user.league = user.calculateLeague();
      await user.save();
    }

    res.status(200).json({
      score,
      passed,
      correct,
      total: day.quiz.length,
      results,
      xpGained,
      userXp: user.xp
    });
  } catch (error) {
    console.error('Quiz submit error:', error);
    res.status(500).json({ message: 'Server error while submitting quiz.' });
  }
};

module.exports = { createGoal, getUserGoals, getGoalById, completeDay, submitQuiz };
