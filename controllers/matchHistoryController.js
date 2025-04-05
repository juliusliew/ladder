const Match = require('../models/matchModel');
const mongoose = require('mongoose');

// Get current user's match history
const getUserMatchHistory = async (req, res) => {
    try {
        const userId = req.user.userId;
        
        // Find matches where the user was either winner or loser
        const matches = await Match.find({
            $or: [
                { "winner.userId": userId },
                { "loser.userId": userId }
            ]
        })
        .sort({ date: -1 }) // Sort by date descending (newest first)
        .limit(5);          // Limit to 5 matches
        
        // Format matches to indicate if the current user won or lost
        const formattedMatches = matches.map(match => {
            const isWinner = match.winner.userId.toString() === userId;
            const opponent = isWinner ? match.loser : match.winner;
            
            return {
                id: match._id,
                date: match.date,
                result: isWinner ? 'win' : 'loss',
                opponentName: opponent.username,
                opponentRating: opponent.eloRating,
                playerRating: isWinner ? match.winner.eloRating : match.loser.eloRating,
                newRating: isWinner ? match.winner.newEloRating : match.loser.newEloRating,
                ratingChange: isWinner ? match.winner.ratingChange : match.loser.ratingChange
            };
        });
        
        res.json(formattedMatches);
    } catch (err) {
        console.error('Error fetching match history:', err);
        res.status(500).json({ message: 'Error fetching match history' });
    }
};

// Get public match history for any player by ID
const getPlayerMatchHistory = async (req, res) => {
    try {
        const playerId = req.params.playerId;
        
        // Validate ObjectId
        if (!mongoose.Types.ObjectId.isValid(playerId)) {
            return res.status(400).json({ message: 'Invalid player ID format' });
        }
        
        // Find matches where the player was either winner or loser
        const matches = await Match.find({
            $or: [
                { "winner.userId": playerId },
                { "loser.userId": playerId }
            ]
        })
        .sort({ date: -1 }) // Sort by date descending (newest first)
        .limit(5);          // Limit to 5 matches
        
        // Format matches to indicate if the specified player won or lost
        const formattedMatches = matches.map(match => {
            const isWinner = match.winner.userId.toString() === playerId;
            const opponent = isWinner ? match.loser : match.winner;
            
            return {
                id: match._id,
                date: match.date,
                result: isWinner ? 'win' : 'loss',
                opponentName: opponent.username,
                opponentRating: opponent.eloRating,
                playerRating: isWinner ? match.winner.eloRating : match.loser.eloRating,
                newRating: isWinner ? match.winner.newEloRating : match.loser.newEloRating,
                ratingChange: isWinner ? match.winner.ratingChange : match.loser.ratingChange
            };
        });
        
        res.json(formattedMatches);
    } catch (err) {
        console.error('Error fetching player match history:', err);
        res.status(500).json({ message: 'Error fetching match history' });
    }
};

module.exports = { getUserMatchHistory, getPlayerMatchHistory };