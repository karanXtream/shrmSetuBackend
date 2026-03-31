import express from 'express';
import authRoutes from './src/routes/auth.routes.js';
import userRoutes from './src/routes/user.routes.js';
import workerRoutes from './src/routes/worker.routes.js';
import { errorHandler, notFound } from './src/middlewares/error.middleware.js';

const app = express();

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/workers', workerRoutes);

// 404 Not Found
app.use(notFound);

// Error handling middleware (must be last)
app.use(errorHandler);

export default app;