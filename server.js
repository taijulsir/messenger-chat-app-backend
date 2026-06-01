import cors from "cors";
import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
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
import Message from "./models/messageModel.js";
import { Chat } from "./models/chatModel.js";
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST"],
  }
});
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Morgan logging setup
if (process.env.NODE_ENV === 'production') {
  const __dirname = path.resolve();
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
app.use('/api/users', protect, userRoutes);
app.use('/api/friends', protect, friendRoutes);
app.use('/api/messages', protect, messageRoutes);
app.use('/api/groups', protect, groupRoutes);


// Middleware for authenticating socket connections
io.use((socket, next) => {
  const token = socket.handshake.query.token;
  if (!token) {
    return next(new Error('Authentication error'));
  }
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return next(new Error('Authentication error'));
    }
    socket.user = decoded;
    next();
  });
});

let usersOnline = {};

io.on('connection', (socket) => {
  console.log('A user connected', socket.id);

  socket.on('register', (userId) => {
    usersOnline[userId] = socket.id;
    console.log(`User ${userId} connected with socket ID ${socket.id}`);
  });

  // Listen for message events
  socket.on('send_message', async (messageData) => {
    try {
      // Check if the recipient is connected
      const recipientSocketId = usersOnline[messageData.to];

      if (recipientSocketId) {
        // Emit the message to the recipient
        io.to(recipientSocketId).emit('receive_message', messageData);
      }

      // Create or get the chat ID
      let chat = await Chat.findOne({
        participants: { $all: [messageData.from, messageData.to] },
      });

      if (!chat) {
        // Create a new chat if not found
        chat = new Chat({
          participants: [messageData.from, messageData.to],
        });
        await chat.save();
      }

      // Save the message to the database
      const newMessage = new Message({
        from: messageData.from,
        to: messageData.to,
        chatId: chat._id,
        content: messageData.content,
      });

      await newMessage.save();
    } catch (error) {
      console.error('Error in send_message socket handler:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('A user disconnected');
    // Remove user from online users
    for (const [userId, socketId] of Object.entries(usersOnline)) {
      if (socketId === socket.id) {
        delete usersOnline[userId];
        console.log(`User ${userId} disconnected`);
        break;
      }
    }
  });
});




// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
