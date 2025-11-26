import mongoose from 'mongoose';

const sessionSchema = new mongoose.Schema({
  userId: mongoose.ObjectId,
  repId: { type: mongoose.ObjectId, default: null },
  status: { type: String, enum: ['bot', 'rep'], default: 'bot' }
}, { timestamps: true });

export default mongoose.model('Session', sessionSchema);
