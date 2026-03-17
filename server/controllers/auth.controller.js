import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import User from '../models/User.model.js';
import generateToken from '../utils/generateToken.js';
import { sendEmail } from '../utils/sendEmail.js';
import { logAuditEvent } from '../utils/auditLogger.js';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_DURATION_MS = 2 * 60 * 60 * 1000; // 2 hours

// @desc    Register user (email verification required before access)
// @route   POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail) {
      return res.status(400).json({ success: false, message: 'Email is required' });
    }
    if (!password || password.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      logAuditEvent('auth.register.blocked_existing_email', { email: normalizedEmail, ip: req.ip }, 'warn');
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }

    const user = new User({ name, email: normalizedEmail, password, phone });
    const verificationToken = user.generateEmailVerificationToken();
    await user.save();

    const verifyURL = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
    await sendEmail({
      to: user.email,
      subject: 'Ghumfir – Verify Your Email',
      html: `<p>Hi ${user.name},</p>
             <p>Please verify your email by clicking the link below. This link expires in 24 hours.</p>
             <p><a href="${verifyURL}">${verifyURL}</a></p>
             <p>If you did not sign up for Ghumfir, you can safely ignore this email.</p>`,
    }).catch((err) => console.error('Verification email failed to send:', err.message));

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account before logging in.',
    });
    logAuditEvent('auth.register.success', { userId: user._id, email: normalizedEmail, ip: req.ip });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ success: false, message: 'Registration failed. Please try again.' });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    if (!normalizedEmail || !password) {
      return res.status(400).json({ success: false, message: 'Email and password required' });
    }

    const user = await User.findOne({ email: normalizedEmail })
      .select('+password +loginAttempts +lockUntil');

    // Perform a constant-time dummy hash compare when user is not found to
    // prevent timing-based email enumeration attacks.
    if (!user) {
      await bcrypt.compare(password, '$2b$12$invalidhashfordummycomparetiming00000000000');
      logAuditEvent('auth.login.failed_unknown_user', { email: normalizedEmail, ip: req.ip }, 'warn');
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }

    // Check if account is currently locked
    if (user.lockUntil && user.lockUntil > Date.now()) {
      const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
      logAuditEvent('auth.login.blocked_locked_account', { userId: user._id, email: normalizedEmail, ip: req.ip }, 'warn');
      return res.status(423).json({
        success: false,
        message: `Account is temporarily locked due to too many failed attempts. Try again in ${minutesLeft} minute(s).`,
      });
    }

    // If a previous lock has expired, reset the counter
    if (user.lockUntil && user.lockUntil <= Date.now()) {
      user.loginAttempts = 0;
      user.lockUntil = undefined;
    }

    const passwordMatch = await user.comparePassword(password);
    if (!passwordMatch) {
      user.loginAttempts = (user.loginAttempts || 0) + 1;
      if (user.loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        user.lockUntil = new Date(Date.now() + LOCK_DURATION_MS);
      }
      await user.save({ validateBeforeSave: false });

      const attemptsLeft = MAX_LOGIN_ATTEMPTS - user.loginAttempts;
      const message =
        attemptsLeft > 0
          ? `Invalid email or password. ${attemptsLeft} attempt(s) remaining before lockout.`
          : 'Account locked due to too many failed attempts. Try again in 2 hours.';
      logAuditEvent('auth.login.failed_bad_password', {
        userId: user._id,
        email: normalizedEmail,
        attempts: user.loginAttempts,
        ip: req.ip,
      }, 'warn');
      return res.status(401).json({ success: false, message });
    }

    // Enforce email verification
    if (!user.isEmailVerified) {
      logAuditEvent('auth.login.blocked_unverified_email', { userId: user._id, email: normalizedEmail, ip: req.ip }, 'warn');
      return res.status(403).json({
        success: false,
        message: 'Email not verified. Please check your inbox and verify your account before logging in.',
        code: 'EMAIL_NOT_VERIFIED',
      });
    }

    if (!user.isActive) {
      logAuditEvent('auth.login.blocked_inactive_account', { userId: user._id, email: normalizedEmail, ip: req.ip }, 'warn');
      return res.status(403).json({ success: false, message: 'Account has been deactivated. Contact support.' });
    }

    // Successful login — reset brute-force counters
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save({ validateBeforeSave: false });

    const token = generateToken(user._id);
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        wishlist: user.wishlist || [],
      },
    });
    logAuditEvent('auth.login.success', { userId: user._id, email: normalizedEmail, ip: req.ip });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' });
  }
};

// @desc    Verify email address via token from email link
// @route   POST /api/auth/verify-email
export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Verification token is required' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    }).select('+emailVerificationToken +emailVerificationExpires');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token. Request a new one.' });
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    const jwtToken = generateToken(user._id);
    res.json({
      success: true,
      message: 'Email verified successfully. You are now logged in.',
      token: jwtToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        wishlist: user.wishlist || [],
      },
    });
  } catch (error) {
    console.error('verifyEmail error:', error);
    res.status(500).json({ success: false, message: 'Verification failed. Please try again.' });
  }
};

// @desc    Resend email verification link
// @route   POST /api/auth/resend-verification
export const resendVerification = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail })
      .select('+emailVerificationToken +emailVerificationExpires');

    // Only send if user exists AND is not yet verified (prevent enumeration via timing)
    if (user && !user.isEmailVerified) {
      const verificationToken = user.generateEmailVerificationToken();
      await user.save({ validateBeforeSave: false });

      const verifyURL = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
      await sendEmail({
        to: user.email,
        subject: 'Ghumfir – Verify Your Email',
        html: `<p>Hi ${user.name},</p>
               <p>Here is your new verification link. It expires in 24 hours.</p>
               <p><a href="${verifyURL}">${verifyURL}</a></p>`,
      }).catch((err) => console.error('Re-send verification email failed:', err.message));
    }

    // Always return the same response to prevent email enumeration
    res.json({
      success: true,
      message: 'If that email is registered and unverified, a new verification link has been sent.',
    });
  } catch (error) {
    console.error('resendVerification error:', error);
    res.status(500).json({ success: false, message: 'Request failed. Please try again.' });
  }
};

// @desc    Send password reset email
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email?.trim().toLowerCase();

    const user = await User.findOne({ email: normalizedEmail })
      .select('+passwordResetToken +passwordResetExpires');

    if (user) {
      const resetToken = user.generatePasswordResetToken();
      await user.save({ validateBeforeSave: false });

      const resetURL = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
      await sendEmail({
        to: user.email,
        subject: 'Ghumfir – Password Reset Request',
        html: `<p>Hi ${user.name},</p>
               <p>You requested a password reset. Click the link below — it expires in 1 hour.</p>
               <p><a href="${resetURL}">${resetURL}</a></p>
               <p>If you did not request this, ignore this email. Your password will remain unchanged.</p>`,
      }).catch(async (err) => {
        console.error('Password reset email failed to send:', err.message);
        // Clean up the token so the user can try again
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({ validateBeforeSave: false });
      });
    }

    // Always return the same response — prevents email enumeration
    res.json({
      success: true,
      message: 'If that email is registered, a password reset link has been sent.',
    });
  } catch (error) {
    console.error('forgotPassword error:', error);
    res.status(500).json({ success: false, message: 'Request failed. Please try again.' });
  }
};

// @desc    Reset password using token from email link
// @route   POST /api/auth/reset-password
export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return res.status(400).json({ success: false, message: 'Token and new password are required' });
    }
    if (newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'Password must be at least 8 characters' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    }).select('+passwordResetToken +passwordResetExpires');

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired password reset token. Request a new one.' });
    }

    user.password = newPassword;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    // Unlock any existing lockout when password is successfully reset
    user.loginAttempts = 0;
    user.lockUntil = undefined;
    await user.save();

    const jwtToken = generateToken(user._id);
    res.json({
      success: true,
      message: 'Password reset successful. You are now logged in.',
      token: jwtToken,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        phone: user.phone,
        wishlist: user.wishlist || [],
      },
    });
  } catch (error) {
    console.error('resetPassword error:', error);
    res.status(500).json({ success: false, message: 'Password reset failed. Please try again.' });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('wishlist', 'title destination price images rating');
    res.json({ success: true, user });
  } catch (error) {
    console.error('getMe error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user profile.' });
  }
};

// @desc    Update profile
// @route   PUT /api/auth/update-profile
export const updateProfile = async (req, res) => {
  try {
    const { name, phone, avatar } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, phone, avatar },
      { new: true, runValidators: true }
    );
    res.json({ success: true, message: 'Profile updated', user });
  } catch (error) {
    console.error('updateProfile error:', error);
    res.status(500).json({ success: false, message: 'Update failed. Please try again.' });
  }
};

// @desc    Change password (authenticated)
// @route   PUT /api/auth/change-password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!newPassword || newPassword.length < 8) {
      return res.status(400).json({ success: false, message: 'New password must be at least 8 characters' });
    }

    const user = await User.findById(req.user._id).select('+password');
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(401).json({ success: false, message: 'Current password is incorrect' });
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    console.error('changePassword error:', error);
    res.status(500).json({ success: false, message: 'Password change failed. Please try again.' });
  }
};

