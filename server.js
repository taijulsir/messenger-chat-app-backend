import cors from "cors";
import express from 'express';
import http from 'http';
import { Server } from 'socket.io'; // Correct way to import in ESM
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import friendRoutes from './routes/friendRoutes.js';
import messageRoutes from './routes/messageRoutes.js';
import groupRoutes from './routes/groupRoutes.js';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { protect } from "./middlewares/authMiddleware.js";
import jwt from 'jsonwebtoken';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"], // Allow both frontends
    methods: ["GET", "POST"],
    // credentials: true, // Allow cookies if needed
  }
});
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Morgan logging setup
if (process.env.NODE_ENV === 'production') {
  const fs = require('fs');
  const path = require('path');
  const logStream = fs.createWriteStream(path.join(__dirname, 'access.log'), { flags: 'a' });
  app.use(morgan('dev', { stream: logStream }));
} else {
  app.use(morgan('dev'));
}

// Middleware to parse JSON
app.use(express.json());
app.use(cors());

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/friends', protect, friendRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/groups', groupRoutes);


// Middleware for authenticating socket connections
io.use((socket, next) => {
  const token = socket.handshake.query.token;  // JWT token passed as query parameter
  if (!token) {
    console.log("No token in the handshake query");

    return next(new Error('Authentication error'));
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new Error('Authentication error'));
    }
    socket.user = decoded;  // Attach decoded user information to socket object
    next();
  });
});

// Socket.io connection handler
io.on('connection', (socket) => {
  console.log('A user connected', socket.id);

  // Listen for chat messages and emit to the intended recipient
  socket.on('send_message', (messageData) => {
    console.log('Message sent:', messageData);
    io.to(messageData.to).emit('receive_message', messageData);  // Send message to the 'to' user
  });

  // Listen for typing indicator and broadcast to other users
  socket.on('typing', (data) => {
    socket.broadcast.emit('typing', data);  // Notify others that the user is typing
  });

  // Handle disconnection
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
