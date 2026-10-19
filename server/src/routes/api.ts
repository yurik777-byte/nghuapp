import { Router, Request, Response } from 'express';
import { rateLimit } from 'express-rate-limit';
import { scheduleService } from '../services/scheduleService.js';
import { BuildingType } from '../types/index.js';

export const apiRouter = Router();

const isTestEnv =
  process.env.NODE_ENV === 'test' ||
  process.env.npm_lifecycle_event === 'test' ||
  process.argv.some((arg) => arg.includes('test'));

const refreshLimiter = rateLimit({
  windowMs: 60 * 1000,
  limit: isTestEnv ? 100 : 3,
  standardHeaders: 'draft-8',
  legacyHeaders: false,
  message: { error: 'Слишком много запросов на обновление. Пожалуйста, подождите 1 минуту.' },
});

/**
 * GET /api/meta
 * Returns timetable metadata (title, semester, period, updatedAt, sourceUrl)
 */
apiRouter.get('/meta', async (_req: Request, res: Response) => {
  try {
    const meta = await scheduleService.getMeta();
    res.json(meta);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch timetable metadata' });
  }
});

/**
 * GET /api/schedule
 * Query params:
 *  - group: string (optional, e.g. "Д-11")
 *  - date: string (optional, "YYYY-MM-DD")
 */
apiRouter.get('/schedule', async (req: Request, res: Response) => {
  try {
    const { group, date } = req.query;

    if (date && typeof date === 'string') {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date.trim())) {
        return res.status(400).json({ error: 'Invalid date format. Expected YYYY-MM-DD' });
      }
    }

    const schedule = await scheduleService.getSchedule({
      group: typeof group === 'string' ? group : undefined,
      date: typeof date === 'string' ? date : undefined,
    });

    res.json(schedule);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch schedule' });
  }
});

/**
 * GET /api/groups
 * Returns list of academic groups with course and department
 */
apiRouter.get('/groups', async (_req: Request, res: Response) => {
  try {
    const groups = await scheduleService.getGroups();
    res.json(groups);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch groups' });
  }
});

/**
 * GET /api/rooms
 * Query params:
 *  - building: "main" | "spartaka" (optional)
 *  - date: string (optional, "YYYY-MM-DD")
 *  - time: string (optional, "HH:MM")
 */
apiRouter.get('/rooms', async (req: Request, res: Response) => {
  try {
    const { building, date, time } = req.query;

    if (building && building !== 'main' && building !== 'spartaka') {
      return res.status(400).json({
        error: "Invalid building parameter. Expected 'main' or 'spartaka'",
      });
    }

    if (date && typeof date === 'string') {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date.trim())) {
        return res.status(400).json({ error: 'Invalid date format. Expected YYYY-MM-DD' });
      }
    }

    const rooms = await scheduleService.getRooms({
      building: building as BuildingType | undefined,
      date: typeof date === 'string' ? date : undefined,
      time: typeof time === 'string' ? time : undefined,
    });

    res.json(rooms);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch rooms' });
  }
});

/**
 * GET /api/teachers
 * Query params:
 *  - name: string (optional filter)
 *  - teacher: string (optional filter alias)
 */
apiRouter.get('/teachers', async (req: Request, res: Response) => {
  try {
    const rawFilter = req.query.name ?? req.query.teacher;
    const nameFilter = typeof rawFilter === 'string' ? rawFilter : undefined;
    const teachers = await scheduleService.getTeachers(nameFilter);
    res.json(teachers);
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to fetch teachers' });
  }
});

/**
 * POST /api/refresh
 * Forces reload and re-parse of schedule
 */
apiRouter.post('/refresh', refreshLimiter, async (_req: Request, res: Response) => {
  try {
    const schedule = await scheduleService.refresh();
    res.json({
      success: true,
      meta: schedule.meta,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Failed to refresh schedule' });
  }
});
