function updateElo(winnerRating, loserRating) {
  const K = 32; // Standard K-factor
  const expectedScore = 1 / (1 + Math.pow(10, (loserRating - winnerRating) / 400));
  
  const ratingChange = Math.round(K * (1 - expectedScore));
  
  const newWinnerRating = Math.round(winnerRating + ratingChange);
  const newLoserRating = Math.round(loserRating - ratingChange);

  return {
      newWinnerRating,
      newLoserRating
  };
}

module.exports = updateElo;