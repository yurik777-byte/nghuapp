import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { apiRouter } from './routes/api.js';
import { scheduleService } from './services/scheduleService.js';

export const app = express();

// Security Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json({ limit: '100kb' }));

// Routes
app.use('/api', apiRouter);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Global error handler
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[Server Error]', err);
  res.status(500).json({ error: err.message || 'Internal server error' });
});

const isTestEnv =
  process.env.NODE_ENV === 'test' ||
  process.env.npm_lifecycle_event === 'test' ||
  process.argv.some((arg) => arg.includes('test'));

// Periodic background refresh every 30 minutes (active only outside test runs)
let refreshTimer: NodeJS.Timeout | null = null;
if (!isTestEnv) {
  const REFRESH_INTERVAL_MS = 30 * 60 * 1000;
  refreshTimer = setInterval(() => {
    scheduleService.refresh().catch((err) => {
      console.error('[Scheduler] Periodic background refresh failed:', err);
    });
  }, REFRESH_INTERVAL_MS);

  // Allow Node process to exit gracefully without timer blocking
  refreshTimer.unref();
}

// Server listen
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

export const server =
  !isTestEnv
    ? app.listen(PORT, () => {
        console.log(`NGHU Timetable Server running on port ${PORT}`);
      })
    : null;

export default app;
