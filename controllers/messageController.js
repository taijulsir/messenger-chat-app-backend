import Message from '../models/messageModel.js';

export const sendMessage = async (req, res) => {
  const { from, to, content } = req.body;
  const message = new Message({ from, to, content });
  await message.save();
  res.status(201).json({ message: 'Message sent' });
};

export const getMessages = async (req, res) => {
  const messages = await Message.find({ to: req.params.chatId });
  res.json(messages);
};