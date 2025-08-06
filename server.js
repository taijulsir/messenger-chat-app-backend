import cors from "cors"
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

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server);  // Instantiate the server with Socket.IO
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
app.use(cors())

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/friends', protect, friendRoutes);
app.use('/api/messages', messageRoutes);
app.use('/api/groups', groupRoutes);

// Real-time communication (Socket.IO events)
io.on("connection", (socket) => {
  console.log("New user connected");

  // Listen for new message
  socket.on("sendMessage", (messageData) => {
    // Handle sending message to DB, then broadcast to the right chat
    console.log("New message:", messageData);
    io.emit("receiveMessage", messageData); // Broadcast message to all clients (can be refined to specific rooms/chats)
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
