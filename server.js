import { Server } from 'socket.io';
import http from 'http';
import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';   // ✅ MongoDB
import Message from './models/Message.js'; // ✅ Message model

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: '*', // Change to Angular app URL if needed
    methods: ['GET', 'POST']
  }
});

// ✅ Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('✅ MongoDB connected'))
.catch((err) => console.error('❌ MongoDB connection error:', err));

const sessions = {}; // Store session states

io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);

  socket.on('start_session', async ({ userId }) => {
    const sessionId = socket.id;
    sessions[sessionId] = { userId, connectedToRep: false };
    socket.join(sessionId);
    console.log(`📌 New session started: ${sessionId}`);

    // ✅ Fetch old messages from DB
    const history = await Message.find({ sessionId }).sort({ timestamp: 1 });
    socket.emit('chat_history', history);
  });

  socket.on('send_message', async ({ sessionId, sender, text }) => {
    console.log(`💬 Message from ${sender}: ${text}`);

    // ✅ Save message in DB
    const newMessage = new Message({
      sessionId,
      sender,
      text
    });
    await newMessage.save();

    // AI can't handle certain keywords → connect to rep
    if (text.toLowerCase().includes('human') || text.toLowerCase().includes('representative')) {
      sessions[sessionId].connectedToRep = true;
      io.to(sessionId).emit('rep_connected', { repId: 'rep123', name: 'John Doe' });
    } else {
      // Normal message
      io.to(sessionId).emit('new_message', { sender, text });

      // ✅ Save AI response as well
      setTimeout(async () => {
        const aiReply = {
          sessionId,
          sender: 'ai',
          text: 'This is an AI-generated response.'
        };

        io.to(sessionId).emit('new_message', aiReply);

        const aiMessage = new Message(aiReply);
        await aiMessage.save();
      }, 800);
    }
  });

  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
    delete sessions[socket.id];
  });
});

server.listen(3000, () => {
  console.log('🚀 Server running on port 3000');
});
