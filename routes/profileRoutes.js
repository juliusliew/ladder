const express = require('express');
const router = express.Router();
const { getUserProfile, getPlayerProfile, updateUserProfile } = require('../controllers/profileController');
const authMiddleware = require('../middleware/authMiddleware');

// Get current user profile - Requires authentication
router.get('/profile', authMiddleware, getUserProfile);

// Get another player's profile - Public route, no auth required
router.get('/player/:playerId', getPlayerProfile);

// Update Profile - Requires authentication
router.put('/profile', authMiddleware, updateUserProfile);

module.exports = router;