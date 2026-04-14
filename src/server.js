import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { connectDB } from './config/db.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const envPath = path.join(__dirname, '..', '.env');

console.log('🔄 Loading .env from:', envPath);
const envConfig = dotenv.config({ path: envPath });
console.log('✅ Env loaded:', !!envConfig.parsed);

console.log('MONGODB_URI:', process.env.MONGODB_URI?.substring(0, 50) + '...');

// Connect to MongoDB
await connectDB();

// Import app AFTER MongoDB is configured
import app from '../app.js';

const PORT = 5000;
const HOST = '0.0.0.0';

// Create HTTP server
const httpServer = createServer(app);

// Socket.IO setup
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Map to store userId -> socketId
const userSockets = new Map();

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('✅ User connected:', socket.id);

  socket.on('registerUser', (userId) => {
    console.log(`🔗 User ${userId} registered with socket ${socket.id}`);
    userSockets.set(userId, socket.id);
  });

  socket.on('message', (data) => {
    console.log('📨 [MESSAGE] ========= SOCKET MESSAGE RECEIVED ==========');
    console.log('📨 [MESSAGE] Raw data:', JSON.stringify(data));
    console.log('📨 [MESSAGE] Data keys:', Object.keys(data));
    
    const { jobPosterId, senderId, senderName, message, negotiationAmount } = data;
    
    console.log('📨 [MESSAGE] Extracted values:');
    console.log('  - jobPosterId:', jobPosterId);
    console.log('  - senderId:', senderId);
    console.log('  - senderName:', senderName);
    console.log('  - message:', message);
    console.log('  - negotiationAmount:', negotiationAmount, 'Type:', typeof negotiationAmount);
    
    if (jobPosterId && userSockets.has(jobPosterId)) {
      const recipientSocketId = userSockets.get(jobPosterId);
      console.log('📨 [MESSAGE] Sending to recipient socket:', recipientSocketId);
      
      const emitPayload = {
        senderId,
        senderName,
        message,
        negotiationAmount: negotiationAmount || null,
        timestamp: new Date()
      };
      console.log('📨 [MESSAGE] Emitting newMessage:', JSON.stringify(emitPayload));
      
      io.to(recipientSocketId).emit('newMessage', emitPayload);
      console.log(`✉️ [MESSAGE] Application forwarded to job poster (amount: ${negotiationAmount || 'none'})`);
    } else {
      console.log(`⚠️ [MESSAGE] Job poster ${jobPosterId} not online or not found`);
    }
    console.log('📨 [MESSAGE] ========= END ==========');
  });

  socket.on('disconnect', () => {
    console.log('❌ User disconnected:', socket.id);
    // Remove user from map
    for (const [userId, socketId] of userSockets.entries()) {
      if (socketId === socket.id) {
        userSockets.delete(userId);
        console.log(`🔓 User ${userId} removed from active users`);
        break;
      }
    }
  });
});

httpServer.listen(PORT, HOST, () => {
  console.log(`✅ Server running on ${HOST}:${PORT}`);
  console.log(`🟢 Socket.IO ready`);
});