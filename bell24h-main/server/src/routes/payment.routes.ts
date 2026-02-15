import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';

export const paymentRouter = Router();

const paymentController = new PaymentController();

paymentRouter.post('/initiate', paymentController.initiatePayment);
paymentRouter.post('/confirm', paymentController.confirmPayment);
paymentRouter.post('/rollback', paymentController.rollbackTransaction);
// Add more routes as needed
