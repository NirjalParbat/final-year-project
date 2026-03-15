import express from 'express';
import { verifyKhaltiPayment, simulateCardPayment } from '../controllers/payment.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/khalti/verify', protect, verifyKhaltiPayment);
router.post('/card/simulate', protect, simulateCardPayment);

export default router;
