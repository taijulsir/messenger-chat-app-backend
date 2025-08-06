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
  const chatId = req.params.chatId;

  try {
    const messages = await Message.find({ chatId })
      .populate('from', 'name email avatar')
      .populate('to', 'name email avatar');

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching messages', error: error.message });
  }
};

