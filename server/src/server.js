import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';
import pool from './config/database.js';
import authRoutes from './routes/auth.routes.js';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Task Manager API is running!' });
});

// Test database route
app.get('/api/test-db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ 
      success: true, 
      time: result.rows[0].now 
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false, 
      error: 'Database query failed' 
    });
  }
});

// Routes
app.use('/api/auth', authRoutes);

// Socket.io connection
io.on('connection', (socket) => {
  console.log('✅ New client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('❌ Client disconnected:', socket.id);
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io ready for connections`);
});