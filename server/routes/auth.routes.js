import express from 'express';
import rateLimit from 'express-rate-limit';
import passport from 'passport';
import generateToken from '../utils/generateToken.js';
import {
  register,
  login,
  verifyEmail,
  resendVerification,
  forgotPassword,
  resetPassword,
  getMe,
  updateProfile,
  changePassword,
} from '../controllers/auth.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// 10 registration attempts per hour per IP
const registerLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many registration attempts. Please try again in an hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 10 login attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 5 password reset / resend-verification requests per hour per IP
const sensitiveActionLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many requests. Please try again in an hour.' },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post('/register', registerLimiter, register);
router.post('/login', loginLimiter, login);
router.post('/verify-email', verifyEmail);
router.post('/resend-verification', sensitiveActionLimiter, resendVerification);
router.post('/forgot-password', sensitiveActionLimiter, forgotPassword);
router.post('/reset-password', sensitiveActionLimiter, resetPassword);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfile);
router.put('/change-password', protect, changePassword);

// --- Google OAuth ---
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Step 1: redirect browser to Google consent screen
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// Step 2: Google redirects back here with auth code
router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${CLIENT_URL}/login?error=google_failed`,
  }),
  (req, res) => {
    const token = generateToken(req.user._id);
    // Destroy the OAuth handshake session — API auth uses JWT from here on
    req.session.destroy(() => {
      res.redirect(`${CLIENT_URL}/auth/callback?token=${encodeURIComponent(token)}`);
    });
  }
);

export default router;
