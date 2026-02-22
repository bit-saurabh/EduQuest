const User = require('../models/User');
const Goal = require('../models/Goal');

// GET /api/leaderboard
const getLeaderboard = async (req, res) => {
  try {
    const users = await User.find({})
      .select('name username xp league streak createdAt')
      .sort({ xp: -1 })
      .limit(100);

    const leaderboard = users.map((user, index) => ({
      rank: index + 1,
      id: user._id,
      name: user.name,
      username: user.username,
      xp: user.xp,
      league: user.league,
      streak: user.streak
    }));

    // Find current user's rank
    const currentUserId = req.user._id.toString();
    const userRank = leaderboard.find(u => u.id.toString() === currentUserId);

    res.status(200).json({
      leaderboard,
      currentUserRank: userRank || null
    });
  } catch (error) {
    console.error('Leaderboard error:', error);
    res.status(500).json({ message: 'Server error while fetching leaderboard.' });
  }
};

// GET /api/profile/:userId
const getProfile = async (req, res) => {
  try {
    const userId = req.params.userId || req.user._id;

    const user = await User.findById(userId).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const goals = await Goal.find({ userId: user._id }).sort({ createdAt: -1 });
    const completedGoals = goals.filter(g => g.completed);

    // Get user rank
    const usersAbove = await User.countDocuments({ xp: { $gt: user.xp } });
    const rank = usersAbove + 1;

    res.status(200).json({
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        xp: user.xp,
        league: user.league,
        streak: user.streak,
        createdAt: user.createdAt
      },
      stats: {
        totalGoals: goals.length,
        completedGoals: completedGoals.length,
        activeGoals: goals.filter(g => !g.completed).length,
        rank
      },
      recentGoals: goals.slice(0, 5)
    });
  } catch (error) {
    console.error('Profile error:', error);
    res.status(500).json({ message: 'Server error while fetching profile.' });
  }
};

module.exports = { getLeaderboard, getProfile };
