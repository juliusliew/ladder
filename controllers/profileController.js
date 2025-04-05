const User = require('../models/userModel');

// Get user profile
const getUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId);
        if (!user) return res.status(404).send('User not found');
        res.json(user);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

// Get public player profile by ID
const getPlayerProfile = async (req, res) => {
    try {
        const user = await User.findById(req.params.playerId);
        if (!user) return res.status(404).json({ message: 'Player not found' });
        
        // Return only public information (username and rating)
        const publicProfile = {
            _id: user._id,
            username: user.username,
            eloRating: user.eloRating
        };
        
        res.json(publicProfile);
    } catch (err) {
        console.error('Error fetching player profile:', err);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update user profile
const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.user.userId, req.body, { new: true });
        res.json(user);
    } catch (err) {
        res.status(500).send('Server error');
    }
};

module.exports = { getUserProfile, getPlayerProfile, updateUserProfile };