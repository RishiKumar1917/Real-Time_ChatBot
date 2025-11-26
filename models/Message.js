// models/Message.js
import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  sessionId: { type: String, required: true },
  sender: { type: String, enum: ['user', 'ai', 'rep'], required: true },
  text: { type: String, required: true },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.model('Message', MessageSchema);
