/*import React, { useEffect, useState } from 'react';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL;

const Profile = () => {
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);
    
    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = localStorage.getItem('token'); // Retrieve the token from local storage

            if (!token) {
                setError("No token found. Please log in.");
                return;
            }

            const config = {
                headers: { Authorization: `Bearer ${token}` } // Include token in request headers
            };

            try {
                const response = await axios.get(`${API_URL}/api/user/profile`, config);
                setUser(response.data); // Assuming response data contains user details
            } catch (error) {
                setError(error.response ? error.response.data.message : "Error fetching profile");
            }
        };

        fetchUserProfile();
    }, []);

    if (error) {
        return <div>Error: {error}</div>;
    }

    if (!user) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>Profile</h1>
            <p>Username: {user.username}</p>
            <p>Elo Rating: {user.eloRating}</p>
        </div>
    );
};

export default Profile;
*/

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import MatchHistory from './MatchHistory';

const API_URL = process.env.REACT_APP_API_URL;

const Profile = () => {
    const [user, setUser] = useState(null);
    const [matches, setMatches] = useState([]);
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(true);
    const [matchesLoading, setMatchesLoading] = useState(true);
    const [matchesError, setMatchesError] = useState(null);
    
    useEffect(() => {
        const fetchUserProfile = async () => {
            const token = localStorage.getItem('token');

            if (!token) {
                setError("No token found. Please log in.");
                setLoading(false);
                setMatchesLoading(false);
                return;
            }

            const config = {
                headers: { Authorization: `Bearer ${token}` }
            };

            try {
                // Fetch user profile
                const userResponse = await axios.get(`${API_URL}/api/user/profile`, config);
                setUser(userResponse.data);
                setLoading(false);
                
                try {
                    // Fetch match history
                    const matchesResponse = await axios.get(`${API_URL}/api/matches/history`, config);
                    setMatches(matchesResponse.data);
                    setMatchesError(null);
                } catch (matchError) {
                    console.error('Error fetching matches:', matchError);
                    setMatchesError(matchError.response?.data?.message || "Error fetching match history");
                } finally {
                    setMatchesLoading(false);
                }
                
            } catch (error) {
                setError(error.response?.data?.message || "Error fetching profile");
                setLoading(false);
                setMatchesLoading(false);
            }
        };

        fetchUserProfile();
    }, []);

    if (loading) {
        return <div className="p-4">Loading...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">Error: {error}</div>;
    }

    if (!user) {
        return <div className="p-4">No user data available</div>;
    }

    return (
        <div className="container mx-auto p-4">
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                <h1 className="text-2xl font-bold mb-4">Profile</h1>
                <div className="profile-header mb-4">
                    <div className="profile-info">
                        <h2 className="text-xl font-semibold">{user.username}</h2>
                        <div className="mt-2">
                            <span className="elo-rating">Elo Rating: {user.eloRating}</span>
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

export default Profile;