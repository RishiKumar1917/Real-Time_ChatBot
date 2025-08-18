require('dotenv').config();
const express = require('express');
const { MongoClient } = require('mongodb');

const app = express();
const port = process.env.PORT || 3000;
const uri = process.env.MONGODB_URI;
const dbName = process.env.DB_NAME;

// Middleware to parse JSON bodies
app.use(express.json());

let db, messages;

// Connect to MongoDB before starting server
async function connectDB() {
  const client = new MongoClient(uri);
  await client.connect();
  db = client.db(dbName);
  messages = db.collection('messages');
  console.log('✅ Connected to MongoDB');
}

// GET all messages
app.get('/messages', async (req, res) => {
  try {
    const allMessages = await messages.find().toArray();
    res.json(allMessages);
  } catch (error) {
    res.status(500).json({ error: 'Error fetching messages' });
  }
});

// POST a new message
app.post('/insertMessages', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }
    const result = await messages.insertOne({ text, createdAt: new Date() });
    res.json({ _id: result.insertedId, text, createdAt: new Date() });
  } catch (error) {
    res.status(500).json({ error: 'Error inserting message' });
  }
});

// Start server after DB connectioncd
connectDB().then(() => {
  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
  });
}).catch(err => {
  console.error('❌ DB connection failed:', err);
});
