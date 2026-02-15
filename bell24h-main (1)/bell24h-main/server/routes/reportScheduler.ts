import express from 'express';
import { 
  createReportSchedule, 
  updateReportSchedule, 
  deleteReportSchedule, 
  getUserSchedules,
  getAllActiveSchedules
} from '../services/reportSchedulerService.js';
import { authenticate } from '../middleware/auth.js';

// Extend express Request interface to include user
interface AuthenticatedRequest extends express.Request {
  user?: {
    id: number;
    username: string;
    email: string;
    role: string;
  };
}

const router = express.Router();

// Middleware to authenticate all scheduler routes
router.use(authenticate);

// POST /api/scheduler - Create a new report schedule
router.post('/', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Convert userId to number
    const scheduleData = {
      ...req.body,
      userId: parseInt(req.user.id.toString())
    };

    const schedule = await createReportSchedule(scheduleData);
    res.json({
      success: true,
      schedule
    });
  } catch (error) {
    console.error('Error creating schedule:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to create schedule'
    });
  }
});

// GET /api/scheduler - Get all user's schedules
router.get('/', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const schedules = await getUserSchedules(parseInt(req.user.id.toString()));
    res.json({
      success: true,
      schedules
    });
  } catch (error) {
    console.error('Error fetching schedules:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch schedules'
    });
  }
});

// GET /api/scheduler/active - Get all active schedules
router.get('/active', async (req, res) => {
  try {
    const schedules = await getAllActiveSchedules();
    res.json({
      success: true,
      schedules
    });
  } catch (error) {
    console.error('Error fetching active schedules:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active schedules'
    });
  }
});

// GET /api/scheduler/:id - Get a specific schedule
router.get('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.user?.id) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const schedule = await getUserSchedules(parseInt(req.user.id.toString()))
      .then(schedules => schedules.find(s => s.id === parseInt(req.params.id)));
    
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    res.json({
      success: true,
      schedule
    });
  } catch (error) {
    console.error('Error fetching schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch schedule'
    });
  }
});

// PUT /api/scheduler/:id - Update a schedule
router.put('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const schedule = await updateReportSchedule(parseInt(req.params.id), req.body);
    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    res.json({
      success: true,
      schedule
    });
  } catch (error) {
    console.error('Error updating schedule:', error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : 'Failed to update schedule'
    });
  }
});

// DELETE /api/scheduler/:id - Delete a schedule
router.delete('/:id', async (req: AuthenticatedRequest, res) => {
  try {
    const success = await deleteReportSchedule(parseInt(req.params.id));
    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    res.json({
      success: true,
      message: 'Schedule deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting schedule:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete schedule'
    });
  }
});

export default router;
