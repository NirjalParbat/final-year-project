import express from 'express';
import {
  getPackages, getPackageById, createPackage,
  updatePackage, deletePackage, toggleWishlist, getFeaturedPackages,
} from '../controllers/package.controller.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import { mongoIdParam, packageFilterValidation } from '../middleware/validation.middleware.js';
import { createRateLimiter } from '../middleware/rateLimit.middleware.js';

const router = express.Router();

const publicReadLimiter = createRateLimiter({
  windowMs: 60 * 1000,
  max: 120,
  message: { success: false, message: 'Too many requests. Please slow down.' },
});

const wishlistLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many wishlist actions. Please try later.' },
});

router.get('/', publicReadLimiter, packageFilterValidation, getPackages);
router.get('/featured', publicReadLimiter, getFeaturedPackages);
router.get('/:id', publicReadLimiter, mongoIdParam('id'), getPackageById);
router.post('/', protect, adminOnly, createPackage);
router.put('/:id', protect, adminOnly, mongoIdParam('id'), updatePackage);
router.delete('/:id', protect, adminOnly, mongoIdParam('id'), deletePackage);
router.post('/:id/wishlist', protect, wishlistLimiter, mongoIdParam('id'), toggleWishlist);

export default router;
