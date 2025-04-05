const handleSocketConnection = (io) => {
    // Keep a map of active socket connections and their associated player data
    const socketPlayerMap = new Map();
    
    io.on('connection', (socket) => {
        console.log(`User connected with socket ID: ${socket.id}`);

        socket.on('joinMatchmaking', async (playerData) => {
            console.log('Received joinMatchmaking event:', {
                socketId: socket.id,
                player: playerData
            });
            
            try {
                // Store player data in the map
                socketPlayerMap.set(socket.id, playerData);
                
                console.log('Player data stored for socket:', socket.id);
            } catch (error) {
                console.error('Error in joinMatchmaking:', error);
                socket.emit('error', { message: 'Failed to join matchmaking' });
            }
        });

        socket.on('leaveMatchmaking', (token) => {
            try {
                console.log('Player leaving matchmaking:', {
                    socketId: socket.id,
                    playerData: socketPlayerMap.get(socket.id)
                });
                
                // Remove from the map
                socketPlayerMap.delete(socket.id);
                
            } catch (error) {
                console.error('Error in leaveMatchmaking:', error);
            }
        });

        socket.on('disconnect', () => {
            try {
                console.log('User disconnected:', {
                    socketId: socket.id,
                    playerData: socketPlayerMap.get(socket.id)
                });
                
                // Remove from the map
                socketPlayerMap.delete(socket.id);
                
            } catch (error) {
                console.error('Error handling disconnect:', error);
            }
        });
    });
};

module.exports = { handleSocketConnection };