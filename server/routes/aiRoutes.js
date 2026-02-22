const express = require('express');
const router = express.Router();
const { generateRoadmap, generateStudyContent } = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);

router.post('/generate-roadmap', generateRoadmap);
router.post('/generate-content', generateStudyContent);

module.exports = router;
