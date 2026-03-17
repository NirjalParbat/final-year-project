import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { sanitizeText } from '../utils/sanitizeText.js';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: 8,
      select: false,
    },
    role: {
      type: String,
      enum: ['user', 'admin'],
      default: 'user',
    },
    avatar: {
      type: String,
      default: '',
    },
    phone: {
      type: String,
      default: '',
    },
    wishlist: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Package',
      },
    ],
    isActive: {
      type: Boolean,
      default: true,
    },
    // --- Email verification ---
    isEmailVerified: {
      type: Boolean,
      default: false,
    },
    emailVerificationToken: { type: String, select: false },
    emailVerificationExpires: { type: Date, select: false },
    // --- Password reset ---
    passwordResetToken: { type: String, select: false },
    passwordResetExpires: { type: Date, select: false },
    // --- Brute-force protection ---
    loginAttempts: { type: Number, default: 0, select: false },
    lockUntil: { type: Date, select: false },
  },
  { timestamps: true }
);

userSchema.pre('validate', function (next) {
  if (typeof this.name === 'string') this.name = sanitizeText(this.name, { maxLength: 80 });
  if (typeof this.phone === 'string') this.phone = sanitizeText(this.phone, { maxLength: 30 });
  if (typeof this.avatar === 'string') this.avatar = sanitizeText(this.avatar, { maxLength: 500 });
  if (typeof this.email === 'string') this.email = sanitizeText(this.email, { maxLength: 255 }).toLowerCase();
  next();
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Generate a cryptographically-secure email verification token (stored hashed)
userSchema.methods.generateEmailVerificationToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours
  return token; // plain token sent via email
};

// Generate a cryptographically-secure password reset token (stored hashed)
userSchema.methods.generatePasswordResetToken = function () {
  const token = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto.createHash('sha256').update(token).digest('hex');
  this.passwordResetExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  return token; // plain token sent via email
};

export default mongoose.model('User', userSchema);
