const express = require('express');
const router = express.Router();
const { getUserMatchHistory, getPlayerMatchHistory } = require('../controllers/matchHistoryController');
const authMiddleware = require('../middleware/authMiddleware');

// Route to get current user's match history - requires authentication
router.get('/history', authMiddleware, getUserMatchHistory);

// Route to get any player's match history - public route
router.get('/player/:playerId', getPlayerMatchHistory);

module.exports = router;