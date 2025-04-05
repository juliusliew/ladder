import React from 'react';

const MatchHistory = ({ matches, loading, error }) => {
    // Format date to more readable format
    const formatDate = (dateString) => {
        const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };

    if (loading) {
        return <div className="p-4">Loading match history...</div>;
    }

    if (error) {
        return <div className="p-4 text-red-500">Error loading matches: {error}</div>;
    }

    if (!matches || matches.length === 0) {
        return <p className="text-gray-500">No match history available.</p>;
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full bg-white">
                <thead className="bg-gray-100">
                    <tr>
                        <th className="py-2 px-4 text-left">Date</th>
                        <th className="py-2 px-4 text-left">Result</th>
                        <th className="py-2 px-4 text-left">Opponent</th>
                        <th className="py-2 px-4 text-left">Rating</th>
                        <th className="py-2 px-4 text-left">New Rating</th>
                        <th className="py-2 px-4 text-left">Change</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {matches.map((match) => (
                        <tr key={match.id} className="hover:bg-gray-50">
                            <td className="py-2 px-4">{formatDate(match.date)}</td>
                            <td className="py-2 px-4">
                                <span className={`match-result ${match.result === 'win' ? 'win' : 'loss'}`}>
                                    {match.result === 'win' ? 'Win' : 'Loss'}
                                </span>
                            </td>
                            <td className="py-2 px-4">{match.opponentName}</td>
                            <td className="py-2 px-4">{match.playerRating}</td>
                            <td className="py-2 px-4">{match.newRating}</td>
                            <td className="py-2 px-4">
                                <span className={match.ratingChange >= 0 ? 'text-green-600' : 'text-red-600'}>
                                    {match.ratingChange > 0 ? '+' : ''}{match.ratingChange}
                                </span>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default MatchHistory;