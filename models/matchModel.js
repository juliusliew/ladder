const mongoose = require('mongoose');

const matchSchema = new mongoose.Schema({
    winner: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        username: { type: String, required: true },
        eloRating: { type: Number, required: true },
        newEloRating: { type: Number, required: true },
        ratingChange: { type: Number, required: true }
    },
    loser: {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        username: { type: String, required: true },
        eloRating: { type: Number, required: true },
        newEloRating: { type: Number, required: true },
        ratingChange: { type: Number, required: true }
    },
    date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Match', matchSchema);
