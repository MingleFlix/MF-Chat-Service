const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const axios = require('axios');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

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

// Swagger setup
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'MF Chat Service API',
      version: '1.0.0',
      description: 'API documentation for the MF Chat Service',
    },
    servers: [
      {
        url: 'http://localhost:4000',
      },
    ],
  },
  apis: ['./server.js'],
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

/**
 * @swagger
 * components:
 *   schemas:
 *     Message:
 *       type: object
 *       required:
 *         - user
 *         - text
 *       properties:
 *         user:
 *           type: string
 *           description: The user who sends the message
 *         text:
 *           type: string
 *           description: The content of the message
 *       example:
 *         user: "John Doe"
 *         text: "Hello, world!"
 */

/**
 * @swagger
 * /join:
 *   post:
 *     summary: User joins the chat
 *     parameters:
 *       - in: query
 *         name: username
 *         schema:
 *           type: string
 *         required: true
 *         description: The username of the user joining the chat
 *     responses:
 *       200:
 *         description: User joined successfully
 *       404:
 *         description: User not found
 */

/**
 * @swagger
 * /message:
 *   post:
 *     summary: Send a message
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Message'
 *     responses:
 *       200:
 *         description: Message sent successfully
 */

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
      socket.emit('message', { user: 'admin', text: 'Error fetching user information' });
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
