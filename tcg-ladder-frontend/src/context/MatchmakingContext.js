import React, { createContext, useReducer, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

// Create socket connection
let socket;
try {
    socket = io(API_URL, {
        transports: ['websocket'],
        autoConnect: true
    });
    console.log('Socket connection initialized');
} catch (error) {
    console.error('Error initializing socket:', error);
}

const MatchmakingContext = createContext();

const initialState = {
    loading: false,
    matchFound: false,
    opponent: null,
    error: null,
    userId: null,
    queue: []
};

const matchmakingReducer = (state, action) => {
    switch (action.type) {
        case 'JOIN_QUEUE':
            return { 
                ...state, 
                loading: true, 
                error: null,
                userId: action.payload.userId 
            };
        case 'MATCH_FOUND':
            return { 
                ...state, 
                loading: false, 
                matchFound: true, 
                opponent: action.payload 
            };
        case 'LEAVE_QUEUE':
            return { 
                ...state, 
                loading: false, 
                matchFound: false, 
                opponent: null, 
                error: null 
            };
        case 'UPDATE_QUEUE':
            return {
                ...state,
                queue: action.payload
            };
        case 'ERROR':
            return { 
                ...state, 
                loading: false, 
                error: action.payload 
            };
        default:
            return state;
    }
};

export const MatchmakingProvider = ({ children }) => {
    const [state, dispatch] = useReducer(matchmakingReducer, initialState);
    const [isConnected, setIsConnected] = useState(false);

    // Fetch queue on initial load
    useEffect(() => {
        const fetchQueue = async () => {
            try {
                const token = localStorage.getItem('token');
                if (token) {
                    const response = await axios.get(`${API_URL}/api/matchmaking/queue`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    
                    if (response.data) {
                        dispatch({ type: 'UPDATE_QUEUE', payload: response.data });
                    }
                }
            } catch (error) {
                console.error('Error fetching queue:', error);
            }
        };

        fetchQueue();
    }, []);

    // Set up socket event listeners
    useEffect(() => {
        if (!socket) return;

        const onConnect = () => {
            console.log('Socket connected:', socket.id);
            setIsConnected(true);
        };

        const onDisconnect = () => {
            console.log('Socket disconnected');
            setIsConnected(false);
        };

        const onQueueUpdated = (updatedQueue) => {
            console.log('Queue updated:', updatedQueue);
            dispatch({ type: 'UPDATE_QUEUE', payload: updatedQueue });
        };

        const onMatchFound = (data) => {
            console.log('Match found:', data);
            dispatch({ type: 'MATCH_FOUND', payload: data.opponent });
        };

        const onError = (error) => {
            console.error('Socket error:', error);
            dispatch({ type: 'ERROR', payload: error.message || 'An error occurred' });
        };

        // Add event listeners
        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('queueUpdated', onQueueUpdated);
        socket.on('matchFound', onMatchFound);
        socket.on('error', onError);

        // Check if already connected
        if (socket.connected) {
            setIsConnected(true);
        }

        // Cleanup
        return () => {
            socket.off('connect', onConnect);
            socket.off('disconnect', onDisconnect);
            socket.off('queueUpdated', onQueueUpdated);
            socket.off('matchFound', onMatchFound);
            socket.off('error', onError);
        };
    }, []);

    // Join the matchmaking queue
    const joinQueue = async (playerData) => {
        if (!socket || !isConnected) {
            dispatch({ type: 'ERROR', payload: 'Socket not connected' });
            return;
        }

        try {
            dispatch({ type: 'JOIN_QUEUE', payload: { userId: playerData.userId } });
            
            // Add socket ID to player data
            const playerWithSocket = {
                ...playerData,
                socketId: socket.id
            };
            
            // Emit socket event
            socket.emit('joinMatchmaking', playerWithSocket);
            
            // Make API call
            const token = localStorage.getItem('token');
            await axios.post(
                `${API_URL}/api/matchmaking/start`,
                { socketId: socket.id },
                { headers: { Authorization: `Bearer ${token}` } }
            );
        } catch (error) {
            console.error('Error joining queue:', error);
            dispatch({ type: 'ERROR', payload: 'Failed to join queue' });
            dispatch({ type: 'LEAVE_QUEUE' });  // Reset to initial state on error
        }
    };

    // Leave the matchmaking queue
    const leaveQueue = async () => {
        if (!socket) return;
        
        try {
            // Emit socket event first
            socket.emit('leaveMatchmaking');
            
            // Then make API call
            const token = localStorage.getItem('token');
            if (token) {
                await axios.post(
                    `${API_URL}/api/matchmaking/cancel`,
                    {},
                    { headers: { Authorization: `Bearer ${token}` } }
                );
            }
        } catch (error) {
            console.error('Error leaving queue:', error);
        } finally {
            // Always update state, even if request fails
            dispatch({ type: 'LEAVE_QUEUE' });
        }
    };

    return (
        <MatchmakingContext.Provider value={{ state, joinQueue, leaveQueue, isConnected }}>
            {children}
        </MatchmakingContext.Provider>
    );
};

export default MatchmakingContext;