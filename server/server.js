import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import mysql from 'mysql2/promise';

// Import configurations and models
import sequelize from './config/db.js';
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import chatRoutes from './routes/chats.js';
import { errorHandler } from './middleware/error.js';
import { initSockets } from './sockets/socketHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env configuration
dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const httpServer = createServer(app);

// Configure CORS for standard Express REST requests
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    callback(null, true);
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve profile uploads or placeholders in the future
app.use('/public', express.static(path.join(__dirname, 'public')));

// Mounting API routers
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chats', chatRoutes);

// Server status endpoint
app.get('/api/status', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Real-time Chat Server is healthy and running',
    timestamp: new Date()
  });
});

// Configure Socket.io server with CORS policies
const io = new Server(httpServer, {
  cors: {
    origin: true, // Dynamically maps to client's WebSocket request origin
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Initialize WebSocket event listeners
initSockets(io);

// Global exception parser
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

// Auto bootstrapping MySQL Database if not exists, then starting server
const bootstrapApp = async () => {
  try {
    const dbName = process.env.DB_NAME || 'chat_application';
    console.log(`Checking if database '${dbName}' exists...`);
    
    // Connect to MySQL server without database selected to create it
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST || '127.0.0.1',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASS || '',
    });
    
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\`;`);
    await connection.end();
    console.log(`Database '${dbName}' is ready`);

    // Synchronize models with database
    await sequelize.authenticate();
    console.log('Sequelize MySQL connection has been established successfully');
    
    // Synchronize models (sync tables with database structures)
    await sequelize.sync({ alter: true });
    console.log('Sequelize models synchronized successfully');

    httpServer.listen(PORT, () => {
      console.log(`Server is running in production mode on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to bootstrap application:', error);
    process.exit(1);
  }
};

bootstrapApp();
