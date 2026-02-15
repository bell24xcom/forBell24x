import { Router } from 'express';
import { postSendNotification, getUserNotifications } from '../controllers/notificationController';

const router = Router();

router.post('/send', postSendNotification);
router.get('/:userId', getUserNotifications);

export default router;
