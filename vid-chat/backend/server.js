require ('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const app = express();
const httpServer = http.createServer(app);

const io = new Server(httpServer, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    }
});

app.use(cors());

const PORT = process.env.PORT || 8000;

app.get('/', (req, res) => {
    res.end('SERVER IS UP... HELLO THERE !!!');
});

io.on('connection', (socket) => {
    console.log(`New connection: ${socket.id}`);

    // Send socket ID to the connected client
    socket.emit('me', socket.id);

    // Handle user disconnection
    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
        socket.broadcast.emit('callEnded');
        socket.leave();
    });

    // Handle call request
    socket.on ('callUser', ({ userToCall, signalData, from, name }) => {
        console.log(`📞 Incoming call from ${from} to ${userToCall}`);
        io.to (userToCall).emit ('callUser', { signal: signalData, from, name });
    });
    
    // Handle answering call
    socket.on ('answerCall', (data) => {
        console.log(`✅ Call answered by ${data.to}`);
        io.to (data.to).emit ('callAccepted', data.signal);
    });
    
});

httpServer.listen(PORT, () => console.log(`SERVER RUNNING ON PORT ${PORT} 🚀`));

