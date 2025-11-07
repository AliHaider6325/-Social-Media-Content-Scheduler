// server/src/app.js
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import authRoutes from './modules/auth/auth.routes.js';

const app = express();

app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || '*'
}));

if (process.env.NODE_ENV !== 'production') app.use(morgan('dev'));

// mount routes
app.use('/api/auth', authRoutes);

// health check
app.get('/api/health', (req, res) => res.json({ ok: true, time: new Date().toISOString() }));

// basic fallback
app.use((req, res) => res.status(404).json({ message: 'Not found' }));

// error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Internal server error' });
});

export default app;
