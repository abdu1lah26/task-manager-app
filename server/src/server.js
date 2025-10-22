import express from 'express';
import cors from 'cors';
import http from 'http';
import { Server } from 'socket.io';
import dotenv from 'dotenv';

// Load environment variables FIRST before importing database
dotenv.config();

import pool from './config/database.js';
import authRoutes from './routes/auth.routes.js';
import projectRoutes from './routes/projects.routes.js';
import taskRoutes from './routes/tasks.routes.js';
import { handleSocketConnection } from './socket/socketHandler.js';

const app = express();
const server = http.createServer(app);

// CORS configuration - allow both local development and production frontend
const allowedOrigins = [
  'http://localhost:3000',
  process.env.CLIENT_URL,
  'https://task-manager-app-scid.vercel.app'
].filter(Boolean); // Remove undefined values

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true
  }
});

app.use(cors({
  origin: allowedOrigins,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
  res.json({ message: 'Task Manager API is running!' });
});

/**
 * Database health check endpoint
 * Returns current database timestamp
 */
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

app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

handleSocketConnection(io);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 Socket.io ready for connections`);
});