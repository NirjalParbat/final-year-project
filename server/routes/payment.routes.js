import express from 'express';
import { verifyKhaltiPayment, simulateCardPayment } from '../controllers/payment.controller.js';
import { protect } from '../middleware/auth.middleware.js';
import { khaltiValidation, cardSimulationValidation } from '../middleware/validation.middleware.js';
import { createRateLimiter } from '../middleware/rateLimit.middleware.js';

const router = express.Router();

const paymentLimiter = createRateLimiter({
	windowMs: 15 * 60 * 1000,
	max: 30,
	message: { success: false, message: 'Too many payment attempts. Please try again later.' },
});

router.post('/khalti/verify', protect, paymentLimiter, khaltiValidation, verifyKhaltiPayment);
router.post('/card/simulate', protect, paymentLimiter, cardSimulationValidation, simulateCardPayment);

export default router;
