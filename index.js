//old
/*
require('dotenv').config();  // To load environment variables from .env file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const matchmakingRoutes = require('./routes/matchmakingRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const socketController = require('./controllers/socketController');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);

app.use(express.json());  // Middleware to parse JSON bodies
//app.use(cors());  // Enable Cross-Origin Request Sharing
app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', profileRoutes);
app.use('/api/matchmaking', matchmakingRoutes);
app.use('/api/leaderboard', leaderboardRoutes);

// Socket.io connection setup
socketController.handleSocketConnection(io);

// Attach io instance to app for global access
app.set('io', io);

// Database connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Database connected successfully');
  })
  .catch((err) => {
    console.error('Database connection error:', err);
    process.exit(1);  // Exit the process if DB connection fails
  });

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
//

*/

require('dotenv').config();  // To load environment variables from .env file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const matchmakingRoutes = require('./routes/matchmakingRoutes');
const leaderboardRoutes = require('./routes/leaderboardRoutes');
const matchHistoryRoutes = require('./routes/matchHistoryRoutes'); // New route
const socketController = require('./controllers/socketController');
const app = express();
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);

app.use(express.json());  // Middleware to parse JSON bodies
app.use(cors({
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/user', profileRoutes);
app.use('/api/matchmaking', matchmakingRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/api/matches', matchHistoryRoutes); // Add the match history routes

// Socket.io connection setup
socketController.handleSocketConnection(io);

// Attach io instance to app for global access
app.set('io', io);

// Database connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Database connected successfully');
  })
  .catch((err) => {
    console.error('Database connection error:', err);
    process.exit(1);  // Exit the process if DB connection fails
  });

// Start the server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});