import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

import casesRouter from './routes/cases';
import companiesRouter from './routes/companies';
import officersRouter from './routes/officers';
import circleAssignmentsRouter from './routes/circleAssignments';
import noticesRouter from './routes/notices';
import scnOrdersRouter from './routes/scnOrders';
import tasksRouter from './routes/tasks';
import remindersRouter from './routes/reminders';
import authRouter from './routes/auth';
import pool from './db';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/api/health', async (_req: Request, res: Response) => {
  try {
    const dbRes = await pool.query('SELECT NOW()');
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      database: 'connected',
      dbTime: dbRes.rows[0].now
    });
  } catch (err: any) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      database: 'disconnected',
      error: err.message
    });
  }
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/cases', casesRouter);
app.use('/api/companies', companiesRouter);
app.use('/api/officers', officersRouter);
app.use('/api/circle-assignments', circleAssignmentsRouter);
app.use('/api/notices', noticesRouter);
app.use('/api/scn-orders', scnOrdersRouter);
app.use('/api/tasks', tasksRouter);
app.use('/api/reminders', remindersRouter);


// Serve static frontend in production (dist folder)
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

app.get('*', (req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith('/api')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).send('Frontend build not found. Run `npm run build` first.');
    }
  });
});

// Global Error Handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Start Server
app.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(`🚀 Revenue Management Production Server running!`);
  console.log(`📡 URL: http://localhost:${PORT}`);
  console.log(`🩺 Health check: http://localhost:${PORT}/api/health`);
  console.log(`=======================================================`);
});

export default app;
