import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';

const router = express.Router();

// Register user or rep
router.post('/register', async (req, res) => {
  const { name, email, password, type } = req.body;
  if (!name || !type || (type !== 'user' && type !== 'rep')) {
    return res.status(400).send('Invalid data');
  }

  const existing = email ? await User.findOne({ email }) : null;
  if (existing) return res.status(400).send('Email exists');

  const passwordHash = password ? await bcrypt.hash(password, 10) : null;
  const user = new User({
    name,
    type,
    email: email || null,
    passwordHash,
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${name}`
  });
  await user.save();

  res.status(201).json({ message: 'Registered successfully', user });
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).send('Invalid credentials');
  }
  const token = jwt.sign({ userId: user._id, type: user.type }, process.env.JWT_SECRET, { expiresIn: '7d' });
  res.json({ token, user });
});

export default router;
