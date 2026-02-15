import { Request, Response } from 'express';
import { sendNotification, getNotificationsForUser } from '../services/notificationService';

export const postSendNotification = (req: Request, res: Response) => {
  const { userId, title, message } = req.body;
  const result = sendNotification(userId, title, message);
  res.json({ sent: result });
};

export const getUserNotifications = (req: Request, res: Response) => {
  const { userId } = req.params;
  const notifications = getNotificationsForUser(userId);
  res.json({ notifications });
};
