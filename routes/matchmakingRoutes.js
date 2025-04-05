const express = require('express');
const router = express.Router();
const { 
    matchmaking, 
    cancelMatchmaking, 
    handleMatchResult,
    getQueue
} = require('../controllers/matchmakingController');
const authMiddleware = require('../middleware/authMiddleware');

// Routes with authMiddleware
router.get('/queue', authMiddleware, getQueue);
router.post('/start', authMiddleware, matchmaking);
router.post('/cancel', authMiddleware, cancelMatchmaking);
router.post('/result', authMiddleware, handleMatchResult);

module.exports = router;