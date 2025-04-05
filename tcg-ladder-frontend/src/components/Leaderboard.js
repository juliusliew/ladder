import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

const Leaderboard = () => {
    const [leaderboard, setLeaderboard] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({
        total: 0,
        page: 1,
        limit: 10,
        pages: 0
    });

    const fetchLeaderboard = async (page = 1) => {
        try {
            setLoading(true);
            const response = await axios.get(`${API_URL}/api/leaderboard?page=${page}&limit=10`);
            
            // Handle both old and new API response formats
            if (Array.isArray(response.data)) {
                // Old format: direct array of users
                setLeaderboard(response.data);
                setPagination({
                    total: response.data.length,
                    page: 1,
                    limit: response.data.length,
                    pages: 1
                });
            } else if (response.data.users) {
                // New format: {users: [...], pagination: {...}}
                setLeaderboard(response.data.users);
                setPagination(response.data.pagination);
            } else {
                console.error('Unexpected API response format:', response.data);
                setError('Unexpected API response format');
            }
            
            setError(null);
        } catch (error) {
            console.error('Error fetching leaderboard:', error);
            setError('Failed to load leaderboard');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLeaderboard();
        
        const refreshInterval = setInterval(() => fetchLeaderboard(pagination.page), 30000); // Refresh every 30 seconds

        return () => clearInterval(refreshInterval);
    }, []);

    const handlePageChange = (newPage) => {
        if (newPage >= 1 && newPage <= pagination.pages) {
            fetchLeaderboard(newPage);
        }
    };

    // Generate pagination buttons
    const renderPaginationButtons = () => {
        const buttons = [];
        const currentPage = pagination.page;
        const totalPages = pagination.pages;
        
        // Always show first page
        buttons.push(
            <li key="first" className={`pagination-item ${currentPage === 1 ? 'active' : ''}`}>
                <button 
                    onClick={() => handlePageChange(1)} 
                    disabled={currentPage === 1}
                >
                    1
                </button>
            </li>
        );
        
        // Show dots if there's a gap after first page
        if (currentPage > 3) {
            buttons.push(<li key="dots1" className="pagination-item dots">...</li>);
        }
        
        // Show pages around current page
        for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
            if (i > 1 && i < totalPages) {
                buttons.push(
                    <li key={i} className={`pagination-item ${currentPage === i ? 'active' : ''}`}>
                        <button onClick={() => handlePageChange(i)}>
                            {i}
                        </button>
                    </li>
                );
            }
        }
        
        // Show dots if there's a gap before last page
        if (currentPage < totalPages - 2) {
            buttons.push(<li key="dots2" className="pagination-item dots">...</li>);
        }
        
        // Always show last page if there's more than one page
        if (totalPages > 1) {
            buttons.push(
                <li key="last" className={`pagination-item ${currentPage === totalPages ? 'active' : ''}`}>
                    <button 
                        onClick={() => handlePageChange(totalPages)} 
                        disabled={currentPage === totalPages}
                    >
                        {totalPages}
                    </button>
                </li>
            );
        }
        
        return buttons;
    };

    if (loading && leaderboard.length === 0) {
        return (
            <div className="loading">
                <div className="loading-spinner"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger">
                {error}
            </div>
        );
    }

    return (
        <div className="container">
            <h1 className="text-3xl font-bold mb-4 mt-3">TCG Ladder Leaderboard</h1>
            
            <div className="table-container">
                <table className="table">
                    <thead>
                        <tr>
                            <th style={{ width: '20%' }}>Rank</th>
                            <th style={{ width: '50%' }}>Player</th>
                            <th style={{ width: '30%' }}>Elo Rating</th>
                        </tr>
                    </thead>
                    <tbody>
                        {leaderboard && leaderboard.map((player) => (
                            <tr key={player._id} className={player.rank <= 3 ? `rank-${player.rank}` : ''}>
                                <td>
                                    <div className="font-bold">
                                        {player.rank}
                                    </div>
                                </td>
                                <td>
                                    <div>
                                        <Link 
                                            to={`/player/${player._id}`} 
                                            className="text-accent hover:underline font-medium"
                                        >
                                            {player.username}
                                        </Link>
                                    </div>
                                </td>
                                <td>
                                    <div className="font-medium">
                                        {player.eloRating}
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            
            {/* Pagination - only show if we have multiple pages */}
            {pagination.pages > 1 && (
                <nav aria-label="Leaderboard pagination">
                    <ul className="pagination">
                        <li className="pagination-item">
                            <button 
                                onClick={() => handlePageChange(pagination.page - 1)} 
                                disabled={pagination.page === 1}
                                aria-label="Previous page"
                            >
                                Previous
                            </button>
                        </li>
                        
                        {renderPaginationButtons()}
                        
                        <li className="pagination-item">
                            <button 
                                onClick={() => handlePageChange(pagination.page + 1)} 
                                disabled={pagination.page === pagination.pages}
                                aria-label="Next page"
                            >
                                Next
                            </button>
                        </li>
                    </ul>
                </nav>
            )}
            
            <div className="text-center text-muted mb-4">
                Showing {leaderboard ? leaderboard.length : 0} of {pagination.total} players
            </div>
        </div>
    );
};

export default Leaderboard;