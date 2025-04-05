// services/matchmakingService.js
const Player = require('../models/playerModel');

const findMatch = async (playerId) => {
    const player = await Player.findById(playerId);
    const potentialMatches = await Player.find({
        elo: { $gte: player.elo - 100, $lte: player.elo + 100 },
        currentMatch: null, // Exclude players already in a match
    }).limit(10); // Limit the number of potential matches

    if (potentialMatches.length > 0) {
        const opponent = potentialMatches[0]; // You can refine this logic
        // Create a match and update both players' currentMatch field
        return { opponent };
    }
    return null; // No match found
};

module.exports = { findMatch };
