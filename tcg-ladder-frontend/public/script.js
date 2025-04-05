document.getElementById('findMatchButton').addEventListener('click', () => {
    const matchStatus = document.getElementById('matchStatus');
    matchStatus.textContent = 'Searching for a match...';

    // Simulate finding a match
    setTimeout(() => {
        matchStatus.textContent = 'Match found! Good luck!';
    }, 2000);
});
