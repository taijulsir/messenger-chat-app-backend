// In messageController.js
import Message from '../models/messageModel.js';
import { Chat } from '../models/chatModel.js';

export const sendMessage = async (req, res) => {
  const { from, to, content } = req.body;

  // Check if chat exists
  let chat = await Chat.findOne({
    participants: { $all: [from, to] }
  });

  // If no chat exists, create one
  if (!chat) {
    chat = new Chat({
      participants: [from, to]
    });
    await chat.save();
  }

  const message = new Message({
    from,
    to,
    content,
    chatId: chat._id
  });

  await message.save();
  res.status(201).json({ message: 'Message sent' });
};

// In messageController.js
export const getMessages = async (req, res) => {
  const { friendId } = req.params; // friendId is passed as a query parameter
  const userId = req.user._id; // The logged-in user ID

  try {
    // Find the chat between the logged-in user and the selected friend
    const chat = await Chat.findOne({
      participants: { $all: [userId, friendId] }, // Both users must be in the chat
    });

    if (!chat) {
      return res.status(200).json({ message: 'No chat found between these users' });
    }

    // If the chat exists, fetch the messages for this chat
    const messages = await Message.find({ chatId: chat._id }).sort({ timestamp: 1 })
      .populate('from', 'name email image')
      .populate('to', 'name email image')

    res.json(messages); // Return the messages
  } catch (error) {
    console.log("direct error")
    console.error(error);
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
};

