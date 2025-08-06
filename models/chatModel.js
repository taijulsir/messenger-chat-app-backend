import mongoose from 'mongoose';
// Chat Model (optional)
const chatSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
});

export const Chat = mongoose.model('Chat', chatSchema);
