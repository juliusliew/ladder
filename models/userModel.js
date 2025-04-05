const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    eloRating: { type: Number, default: 1200 }, // Default starting Elo
});

module.exports = mongoose.model('User', userSchema);
