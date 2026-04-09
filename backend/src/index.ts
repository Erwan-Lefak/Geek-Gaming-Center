/**
 * Main Entry Point - Geek Gaming Center Backend
 * Express server with PostgreSQL & Redis
 */

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { createServer } from 'http';
import { Pool } from 'pg';
import Redis from 'ioredis';

import bookingRoutes from './routes/booking.routes';
import availabilityRoutes from './routes/availability.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 9000;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/booking', bookingRoutes);
app.use('/api/availability', availabilityRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handling
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

const server = createServer(app);

server.listen(PORT, () => {
  console.log(`🚀 Geek Gaming Center Backend running on port ${PORT}`);
  console.log(`📚 API: http://localhost:${PORT}`);
  console.log(`🏥 Health: http://localhost:${PORT}/health`);
});
