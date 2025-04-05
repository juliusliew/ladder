const User = require('../models/userModel');

const getLeaderboard = async (req, res) => {
    try {
        // Get pagination parameters from query
        const page = parseInt(req.query.page) || 1; // Default to page 1
        const limit = parseInt(req.query.limit) || 10; // Default to 10 users per page
        const skip = (page - 1) * limit;

        // Get total count of users for pagination info
        const totalUsers = await User.countDocuments();
        
        // Get users for current page, sorted by eloRating in descending order
        const users = await User.find({}, 'username eloRating')
            .sort({ eloRating: -1 })
            .skip(skip)
            .limit(limit)
            .lean();

        // Add rank to each user based on their position in the overall leaderboard
        const rankedUsers = users.map((user, index) => ({
            ...user,
            rank: skip + index + 1 // Calculate actual rank based on pagination
        }));

        // Return leaderboard with pagination info
        res.json({
            users: rankedUsers,
            pagination: {
                total: totalUsers,
                page,
                limit,
                pages: Math.ceil(totalUsers / limit)
            }
        });
    } catch (error) {
        console.error('Error fetching leaderboard:', error);
        res.status(500).json({ message: 'Error fetching leaderboard' });
    }
};

module.exports = { getLeaderboard };