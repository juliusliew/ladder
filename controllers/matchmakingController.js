const User = require('../models/userModel');
const Match = require('../models/matchModel');
const updateElo = require('../utils/elo');

let matchmakingQueue = [];

const matchmaking = async (req, res) => {
    try {
        const { username, userId } = req.user;
        const socketId = req.body.socketId;

        // Get fresh user data from database to ensure current Elo
        const currentUser = await User.findById(userId);
        if (!currentUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        console.log('🟢 Matchmaking request received:', {
            username,
            userId,
            eloRating: currentUser.eloRating,
            socketId
        });

        // Check for existing player in queue
        const existingPlayerIndex = matchmakingQueue.findIndex((p) => p.id === userId);
        
        if (existingPlayerIndex !== -1) {
            console.log('❌ Player already in queue:', userId);
            return res.status(400).json({ message: 'Already in matchmaking queue' });
        }

        // Add player to queue with current Elo
        const player = { 
            id: userId, 
            name: username, 
            eloRating: currentUser.eloRating, 
            socketId 
        };
        
        matchmakingQueue.push(player);
        console.log('📋 Queue after adding player:', matchmakingQueue);

        // Notify queue update
        const io = req.app.get('io');
        if (io) {
            io.emit('queueUpdated', matchmakingQueue);
        } else {
            console.error('❌ Socket.IO instance not found');
        }

        // Look for match
        const match = matchmakingQueue.find(
            (opponent) => 
                opponent.id !== userId && 
                Math.abs(opponent.eloRating - currentUser.eloRating) <= 100
        );

        if (match) {
            console.log('🏁 Match found:', {
                player1: username,
                player2: match.name
            });

            // Remove both players from queue
            matchmakingQueue = matchmakingQueue.filter(
                (p) => p.id !== userId && p.id !== match.id
            );

            // Get fresh opponent data
            const opponent = await User.findById(match.id);

            // Notify both players
            if (io) {
                io.to(socketId).emit('matchFound', {
                    opponent: {
                        id: match.id,
                        name: match.name,
                        eloRating: opponent.eloRating
                    }
                });

                io.to(match.socketId).emit('matchFound', {
                    opponent: {
                        id: userId,
                        name: username,
                        eloRating: currentUser.eloRating
                    }
                });
            }

            return res.json({ 
                matchFound: true, 
                opponent: {
                    id: match.id,
                    name: match.name,
                    eloRating: opponent.eloRating
                }
            });
        }

        return res.json({ 
            matchFound: false, 
            message: 'Waiting for opponent...',
            queuePosition: matchmakingQueue.length
        });

    } catch (error) {
        console.error('❌ Error in matchmaking:', error);
        return res.status(500).json({ 
            message: 'Internal server error',
            error: error.toString() 
        });
    }
};

const cancelMatchmaking = async (req, res) => {
    try {
        const { userId, username } = req.user;
        
        console.log('🚨 Cancel Matchmaking Request:', {
            userId,
            username,
            currentQueueLength: matchmakingQueue.length
        });
        
        // Log current queue state before removal
        console.log('📋 Queue before removal:', 
            matchmakingQueue.map(player => ({
                id: player.id, 
                name: player.name
            }))
        );
        
        // Remove player from queue
        const initialQueueLength = matchmakingQueue.length;
        matchmakingQueue = matchmakingQueue.filter(player => player.id !== userId);
        
        console.log('🔍 Queue removal results:', {
            removedPlayers: initialQueueLength - matchmakingQueue.length,
            remainingQueueLength: matchmakingQueue.length
        });
        
        // Get the io instance to emit queue update
        const io = req.app.get('io');
        if (io) {
            console.log('🌐 Emitting queueUpdated event');
            io.emit('queueUpdated', matchmakingQueue);
        } else {
            console.error('❌ Socket.IO instance not found');
        }

        return res.status(200).json({ 
            message: 'Left matchmaking queue',
            queueLength: matchmakingQueue.length
        });
    } catch (error) {
        console.error('❌ Error in cancelMatchmaking:', error);
        return res.status(500).json({ 
            message: 'Internal server error', 
            error: error.toString() 
        });
    }
};

const handleMatchResult = async (req, res) => {
    try {
        const { winnerId, loserId } = req.body;
        console.log('🏆 Match result received:', { winnerId, loserId });

        // Get players from database
        const winner = await User.findById(winnerId);
        const loser = await User.findById(loserId);

        if (!winner || !loser) {
            console.error('❌ Player not found:', { winner, loser });
            return res.status(404).json({ message: 'One or both players not found' });
        }

        // Calculate new ratings
        const { newWinnerRating, newLoserRating } = updateElo(winner.eloRating, loser.eloRating);

        console.log('📊 New ratings calculated:', {
            winner: {
                old: winner.eloRating,
                new: newWinnerRating
            },
            loser: {
                old: loser.eloRating,
                new: newLoserRating
            }
        });

        // Update ratings in database
        await User.findByIdAndUpdate(winnerId, { eloRating: newWinnerRating });
        await User.findByIdAndUpdate(loserId, { eloRating: newLoserRating });

        // Create a new match record
        const matchRecord = new Match({
            winner: {
                userId: winnerId,
                username: winner.username,
                eloRating: winner.eloRating,
                newEloRating: newWinnerRating,
                ratingChange: newWinnerRating - winner.eloRating
            },
            loser: {
                userId: loserId,
                username: loser.username,
                eloRating: loser.eloRating,
                newEloRating: newLoserRating,
                ratingChange: newLoserRating - loser.eloRating
            }
        });

        await matchRecord.save();

        // Notify both players
        const io = req.app.get('io');
        if (io) {
            io.emit('matchResult', {
                winner: {
                    id: winnerId,
                    newRating: newWinnerRating,
                    ratingChange: newWinnerRating - winner.eloRating
                },
                loser: {
                    id: loserId,
                    newRating: newLoserRating,
                    ratingChange: newLoserRating - loser.eloRating
                }
            });
        }

        return res.json({
            message: 'Match result recorded successfully',
            winner: {
                id: winnerId,
                newRating: newWinnerRating,
                ratingChange: newWinnerRating - winner.eloRating
            },
            loser: {
                id: loserId,
                newRating: newLoserRating,
                ratingChange: newLoserRating - loser.eloRating
            }
        });

    } catch (error) {
        console.error('❌ Error handling match result:', error);
        return res.status(500).json({ message: 'Error processing match result' });
    }
};

// Get current queue
const getQueue = async (req, res) => {
    try {
        console.log('📋 Current Queue Requested:', matchmakingQueue);
        return res.json(matchmakingQueue);
    } catch (error) {
        console.error('❌ Error fetching queue:', error);
        return res.status(500).json({ message: 'Error fetching queue' });
    }
};

module.exports = {
    matchmaking,
    cancelMatchmaking,
    handleMatchResult,
    getQueue
};