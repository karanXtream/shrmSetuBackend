import express from 'express';
import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';
import workerRoutes from './src/routes/worker.routes.js';
import msg91Routes from './src/routes/msg91.routes.js';
import postRoutes from './src/routes/post.routes.js';
import { errorHandler, notFound } from './src/middlewares/error.middleware.js';

const app = express();

// Middleware - JSON Parser with larger limit for file uploads
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Debug middleware to log requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  if (req.body) {
    console.log('Body:', req.body);
  }
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workers', workerRoutes);
app.use('/api/msg91', msg91Routes);
app.use('/api/posts', postRoutes);

// 404 Not Found
app.use(notFound);

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;