const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.static('public'));

const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

io.on('connection', (socket) => {
  console.log('New client connected');

  socket.on('join', async (username) => {
    try {
      const response = await axios.get(`http://localhost:5000/users/${username}`);
      const user = response.data;
      console.log(`${user.name} joined the chat`);
      socket.broadcast.emit('message', { user: 'admin', text: `${user.name} has joined the chat` });
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  });

  socket.on('message', (message) => {
    io.emit('message', message);
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
