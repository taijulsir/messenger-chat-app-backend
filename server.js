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
import Message from "./models/messageModel.js";
import { Chat } from "./models/chatModel.js";
import User from "./models/userModel.js";

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
app.use('/api/users', protect, userRoutes);
app.use('/api/friends', protect, friendRoutes);
app.use('/api/messages', protect, messageRoutes);
app.use('/api/groups', protect, groupRoutes);


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

let usersOnline = {};

io.on('connection', (socket) => {
  console.log('A user connected', socket.id);

  socket.on('register', (userId) => {
    // Store the socket ID for the user
    usersOnline[userId] = socket.id;
    console.log(`User ${userId} connected with socket ID ${socket.id}`);

    // Emit the online status to all connected users
    io.emit('user_status', { userId, status: 'online' });
  });

  // Listen for message events
  socket.on('send_message', async (messageData) => {
    // Check if the recipient is connected
    const recipientSocketId = usersOnline[messageData.to];

    if (recipientSocketId) {
      // Emit the message to the recipient
      io.to(recipientSocketId).emit('receive_message', messageData);

    } else {
      console.log('Recipient not connected, store the message in db');
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
    console.log("message saved");
  });

  // Listen for typing events
  socket.on('typing', (data) => {
    const recipientSocketId = usersOnline[data.to];

    if (recipientSocketId) {
      // Emit typing indicator to the recipient user
      io.to(recipientSocketId).emit('typing', { name: data.name, to: data.to });
    }
  });


  socket.on('disconnect', async () => {
    console.log('A user disconnected');
    for (const [userId, socketId] of Object.entries(usersOnline)) {
      if (socketId === socket.id) {
        delete usersOnline[userId];
        console.log(`User ${userId} disconnected`);

        // Use await to ensure the update is completed before emitting the offline status
        try {
          const updatedUser = await User.findByIdAndUpdate(
            userId,
            { lastActive: new Date() },
            { new: true } // This will return the updated document
          );

          console.log(`User ${userId} last active time updated: ${updatedUser.lastActive}`);

          // Emit the offline status to all users
          io.emit('user_status', { userId, status: 'offline', lastActive: updatedUser.lastActive });
        } catch (err) {
          console.error(`Error updating last active time for user ${userId}:`, err);
        }
        break;
      }
    }
  });

});




// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
