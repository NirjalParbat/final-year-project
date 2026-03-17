import express from 'express';
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
import {
  registerValidation,
  loginValidation,
  tokenValidation,
  emailValidation,
  resetPasswordValidation,
  updateProfileValidation,
  changePasswordValidation,
} from '../middleware/validation.middleware.js';
import { createRateLimiter } from '../middleware/rateLimit.middleware.js';

const router = express.Router();

// 10 registration attempts per hour per IP
const registerLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many registration attempts. Please try again in an hour.' },
});

// 10 login attempts per 15 minutes per IP
const loginLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { success: false, message: 'Too many login attempts. Please try again in 15 minutes.' },
});

// 5 password reset / resend-verification requests per hour per IP
const sensitiveActionLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: { success: false, message: 'Too many requests. Please try again in an hour.' },
});

const googleAuthLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: 'Too many Google auth attempts. Please try again later.' },
});

router.post('/register', registerLimiter, registerValidation, register);
router.post('/login', loginLimiter, loginValidation, login);
router.post('/verify-email', tokenValidation, verifyEmail);
router.post('/resend-verification', sensitiveActionLimiter, emailValidation, resendVerification);
router.post('/forgot-password', sensitiveActionLimiter, emailValidation, forgotPassword);
router.post('/reset-password', sensitiveActionLimiter, resetPasswordValidation, resetPassword);
router.get('/me', protect, getMe);
router.put('/update-profile', protect, updateProfileValidation, updateProfile);
router.put('/change-password', protect, changePasswordValidation, changePassword);

// --- Google OAuth ---
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Step 1: redirect browser to Google consent screen
router.get('/google', googleAuthLimiter, passport.authenticate('google', { scope: ['profile', 'email'] }));

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
