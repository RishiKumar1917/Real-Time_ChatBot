import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  name: String,
  type: { type: String, enum: ['user', 'rep'], required: true },
  email: { type: String, unique: true, sparse: true },
  passwordHash: String,
  avatar: String
});

export default mongoose.model('User', userSchema);
