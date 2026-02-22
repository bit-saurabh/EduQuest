const express = require('express');
const router = express.Router();
const { getLeaderboard, getProfile } = require('../controllers/leaderboardController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.get('/', getLeaderboard);
router.get('/profile/:userId', getProfile);
router.get('/profile', getProfile);

module.exports = router;
