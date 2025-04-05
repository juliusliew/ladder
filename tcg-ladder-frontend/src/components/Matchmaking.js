import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { io } from 'socket.io-client';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create socket connection
const socket = io(API_URL, {
    transports: ['websocket'],
    autoConnect: true
});

const Matchmaking = () => {
    const [inQueue, setInQueue] = useState(false);
    const [matchFound, setMatchFound] = useState(false);
    const [opponent, setOpponent] = useState(null);
    const [queue, setQueue] = useState([]);
    const [matchResult, setMatchResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Fetch initial queue data on component mount
    useEffect(() => {
        // Function to fetch current queue from server
        const fetchCurrentQueue = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;
                
                const response = await axios.get(`${API_URL}/api/matchmaking/queue`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                
                if (response.data && Array.isArray(response.data)) {
                    setQueue(response.data);
                }
            } catch (error) {
                console.error('Error fetching current queue:', error);
            }
        }, [navigate, inQueue]);

        fetchCurrentQueue();
        
        // Setup socket listeners
        socket.on('connect', () => {
            console.log('Connected to socket server with ID:', socket.id);
        });

        socket.on('queueUpdated', (updatedQueue) => {
            console.log('Queue updated:', updatedQueue);
            setQueue(updatedQueue);
        });

        socket.on('matchFound', (data) => {
            console.log('Match found:', data);
            setMatchFound(true);
            setOpponent(data.opponent);
            setInQueue(false);
            setLoading(false);
        });

        socket.on('matchResult', (result) => {
            console.log('Match result received:', result);
            // Get current user's ID from token
            const token = localStorage.getItem('token');
            const userId = token ? JSON.parse(atob(token.split('.')[1])).userId : null;
            
            // Determine if current user is winner or loser
            const userResult = result.winner.id === userId ? result.winner : result.loser;
            
            setMatchResult({
                newRating: userResult.newRating,
                ratingChange: userResult.ratingChange
            });
        });

        return () => {
            socket.off('connect');
            socket.off('queueUpdated');
            socket.off('matchFound');
            socket.off('matchResult');
            
            // If in queue when component unmounts, leave the queue
            if (inQueue) {
                handleLeaveQueue();
            }
        };
    }, []);

    const handleJoinQueue = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                navigate('/login');
                return;
            }

            // Get user data from token for logging
            const tokenData = JSON.parse(atob(token.split('.')[1]));
            console.log('User data from token:', tokenData);

            // Emit socket event to join matchmaking
            const playerData = {
                userId: tokenData.userId,
                username: tokenData.username,
                socketId: socket.id
            };
            
            socket.emit('joinMatchmaking', playerData);
            console.log('Emitted joinMatchmaking with:', playerData);
            
            // API call to start matchmaking
            const response = await axios.post(
                `${API_URL}/api/matchmaking/start`,
                { socketId: socket.id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            console.log('Join queue response:', response.data);
            
            setInQueue(true);
        } catch (error) {
            console.error('Error joining queue:', error);
            alert('Failed to join queue. See console for details.');
        } finally {
            setLoading(false);
        }
    };

    const handleLeaveQueue = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) return;
            
            // Emit socket event to leave matchmaking
            socket.emit('leaveMatchmaking', token);
            console.log('Emitted leaveMatchmaking');
            
            // API call to cancel matchmaking
            const response = await axios.post(
                `${API_URL}/api/matchmaking/cancel`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            console.log('Leave queue response:', response.data);
            
            setInQueue(false);
        } catch (error) {
            console.error('Error leaving queue:', error);
            // Still set inQueue to false even if there's an error
            setInQueue(false);
        } finally {
            setLoading(false);
        }
    };

    const handleMatchResult = async (isWinner) => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const userId = JSON.parse(atob(token.split('.')[1])).userId;
            
            const response = await axios.post(`${API_URL}/api/matchmaking/result`,
                {
                    winnerId: isWinner ? userId : opponent.id,
                    loserId: isWinner ? opponent.id : userId
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            
            console.log('Match result response:', response.data);
            
            setMatchResult({
                newRating: response.data[isWinner ? 'winner' : 'loser'].newRating,
                ratingChange: response.data[isWinner ? 'winner' : 'loser'].ratingChange
            });
        } catch (error) {
            console.error('Error submitting match result:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleFindNewMatch = () => {
        setMatchFound(false);
        setOpponent(null);
        setMatchResult(null);
        handleJoinQueue();
    };

    return (
        <div className="matchmaking-container">
            <h1 className="matchmaking-title">Matchmaking</h1>
            
            {!matchFound ? (
                <div className="card mb-4">
                    <div className="card-body text-center">
                        {!inQueue ? (
                            <button
                                className="find-match-btn"
                                onClick={handleJoinQueue}
                                disabled={loading}
                            >
                                Find Match
                            </button>
                        ) : (
                            <div>
                                <div className="searching-indicator mb-4">
                                    Searching for opponent
                                </div>
                                <button
                                    className="cancel-btn"
                                    onClick={handleLeaveQueue}
                                    disabled={loading}
                                >
                                    Cancel
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="card mb-4">
                    <div className="card-header">
                        <h2 className="card-title">Match Found!</h2>
                    </div>
                    <div className="card-body">
                        <div className="mb-4">
                            <p className="text-xl mb-1">Opponent: <span className="font-bold">{opponent?.name}</span></p>
                            <p className="text-lg">Opponent's Elo: <span className="font-medium">{opponent?.eloRating}</span></p>
                        </div>
                        
                        {!matchResult && (
                            <div className="d-flex justify-center gap-3 mt-4">
                                <button
                                    className="btn btn-success btn-lg"
                                    onClick={() => handleMatchResult(true)}
                                    disabled={loading}
                                >
                                    I Won
                                </button>
                                <button
                                    className="btn btn-danger btn-lg"
                                    onClick={() => handleMatchResult(false)}
                                    disabled={loading}
                                >
                                    I Lost
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {matchResult && (
                <div className="card">
                    <div className="card-header">
                        <h3 className="card-title">Match Complete!</h3>
                    </div>
                    <div className="card-body text-center">
                        <p className="text-xl mb-2">New Rating: <span className="font-bold">{matchResult.newRating}</span></p>
                        <p className="text-lg mb-4">
                            Rating Change: 
                            <span className={`font-bold ml-2 ${matchResult.ratingChange > 0 ? 'text-success' : 'text-danger'}`}>
                                {matchResult.ratingChange > 0 ? '+' : ''}{matchResult.ratingChange}
                            </span>
                        </p>
                        <button
                            className="find-match-btn"
                            onClick={handleFindNewMatch}
                            disabled={loading}
                        >
                            Find New Match
                        </button>
                    </div>
                </div>
            )}

            {/* Current Queue */}
            <div className="card mt-5">
                <div className="card-header">
                    <h2 className="card-title">Current Queue ({queue.length || 0} players)</h2>
                </div>
                <div className="card-body">
                    {queue.length === 0 ? (
                        <p className="text-muted text-center">Queue is empty</p>
                    ) : (
                        <ul className="divide-y">
                            {queue.map((player) => (
                                <li key={player.id} className="py-3 px-2 d-flex justify-between">
                                    <span className="font-medium">{player.name}</span>
                                    <span>Elo: {player.eloRating}</span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Matchmaking;
