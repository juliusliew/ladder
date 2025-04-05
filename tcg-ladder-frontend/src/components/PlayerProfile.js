import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import MatchHistory from './MatchHistory';

const API_URL = process.env.REACT_APP_API_URL;

const PlayerProfile = () => {
    const { playerId } = useParams();
    const [player, setPlayer] = useState(null);
    const [matches, setMatches] = useState([]);
    const [loading, setLoading] = useState(true);
    const [matchesLoading, setMatchesLoading] = useState(true);
    const [error, setError] = useState(null);
    const [matchesError, setMatchesError] = useState(null);
    
    useEffect(() => {
        const fetchPlayerData = async () => {
            try {
                setLoading(true);
                const response = await axios.get(`${API_URL}/api/user/player/${playerId}`);
                setPlayer(response.data);
                setError(null);
            } catch (error) {
                console.error('Error fetching player profile:', error);
                setError('Failed to load player profile');
            } finally {
                setLoading(false);
            }
        };

        const fetchPlayerMatches = async () => {
            try {
                setMatchesLoading(true);
                const response = await axios.get(`${API_URL}/api/matches/player/${playerId}`);
                setMatches(response.data);
                setMatchesError(null);
            } catch (error) {
                console.error('Error fetching player matches:', error);
                setMatchesError('Failed to load match history');
            } finally {
                setMatchesLoading(false);
            }
        };

        fetchPlayerData();
        fetchPlayerMatches();
    }, [playerId]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <p>Loading player profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex justify-center items-center h-64">
                <p className="text-red-500">{error}</p>
            </div>
        );
    }

    if (!player) {
        return (
            <div className="flex justify-center items-center h-64">
                <p>Player not found</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-4">
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <h1 className="text-2xl font-bold mb-4">Player Profile</h1>
                <div className="profile-header mb-4">
                    <div className="profile-info">
                        <h2 className="text-xl font-semibold">{player.username}</h2>
                        <div className="mt-2">
                            <span className="elo-rating">Elo Rating: {player.eloRating}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow-md rounded-lg p-6">
                <h2 className="text-xl font-bold mb-4">Recent Matches</h2>
                <MatchHistory 
                    matches={matches} 
                    loading={matchesLoading} 
                    error={matchesError} 
                />
            </div>
        </div>
    );
};

export default PlayerProfile;