//old

// const User = require('../models/userModel');
// const bcrypt = require('bcrypt');
// const jwt = require('jsonwebtoken');

// const register = async (req, res) => {
//     try {
//         // Hash password
//         const hashedPassword = await bcrypt.hash(req.body.password, 10);

//         // Create new user
//         const newUser = new User({
//             username: req.body.username,
//             email: req.body.email,
//             password: hashedPassword,
//         });

//         // Save the user to the database
//         const savedUser = await newUser.save();
//         res.status(201).json({ message: "User created successfully", user: savedUser });
//     } catch (err) {
//         res.status(500).json({ message: "Error registering user", error: err });
//     }
// };

// const login = async (req, res) => {
//     try {
//         // Check if user exists
//         const user = await User.findOne({ email: req.body.email });
//         if (!user) return res.status(404).json({ message: "User not found" });

//         // Compare password
//         const validPassword = await bcrypt.compare(req.body.password, user.password);
//         if (!validPassword) return res.status(400).json({ message: "Invalid password" });

//         // Generate JWT token
//         //const token = jwt.sign({ userId: user._id }, 'your_secret_key', { expiresIn: '1h' });
//         // Generate JWT token with eloRating included
//         const token = jwt.sign({ username: user.username, userId: user._id, eloRating: user.eloRating }, 'your_secret_key', { expiresIn: '1h' });

//         res.status(200).json({ message: "Logged in successfully", token });
//     } catch (err) {
//         res.status(500).json({ message: "Error logging in", error: err });
//     }
// };

// /*const profile = async (req, res) => {
//     try {
//         // Assuming you decode the token and get the user ID
//         const userId = req.user.id; // This assumes you have middleware that attaches the user to the request
//         const user = await User.findById(userId);
//         if (!user) return res.status(404).json({ message: "User not found" });
//         res.status(200).json({ user });
//     } catch (err) {
//         res.status(500).json({ message: "Error fetching profile", error: err });
//     }
// };*/

// module.exports = { register, login/*, profile*/ };

const User = require('../models/userModel');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Create new user
        const newUser = new User({
            username: req.body.username,
            email: req.body.email,
            password: hashedPassword,
        });

        // Save the user to the database
        const savedUser = await newUser.save();
        res.status(201).json({ message: "User created successfully", user: savedUser });
    } catch (err) {
        res.status(500).json({ message: "Error registering user", error: err });
    }
};

const login = async (req, res) => {
    try {
        // Check if user exists
        const user = await User.findOne({ email: req.body.email });
        if (!user) return res.status(404).json({ message: "User not found" });

        // Compare password
        const validPassword = await bcrypt.compare(req.body.password, user.password);
        if (!validPassword) return res.status(400).json({ message: "Invalid password" });

        // Generate JWT token with eloRating included
        const token = jwt.sign({ username: user.username, userId: user._id, eloRating: user.eloRating }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: "Logged in successfully", token });
    } catch (err) {
        res.status(500).json({ message: "Error logging in", error: err });
    }
};

module.exports = { register, login };
