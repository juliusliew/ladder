// models/playerModel.js
const mongoose = require('mongoose');

const playerSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    elo: { type: Number, default: 1200 }, // Initial Elo rating
    matchesPlayed: { type: Number, default: 0 },
    wins: { type: Number, default: 0 },
    losses: { type: Number, default: 0 },
    currentMatch: { type: mongoose.Schema.Types.ObjectId, ref: 'Match' },
});

const Player = mongoose.model('Player', playerSchema);
module.exports = Player;
