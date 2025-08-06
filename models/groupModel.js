import mongoose from 'mongoose';

const groupSchema = new mongoose.Schema({
  name: { type: String, required: true },
  members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  messages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Message' }],
});

export default mongoose.model('Group', groupSchema);