import express from 'express';
import {
  getPackages, getPackageById, createPackage,
  updatePackage, deletePackage, toggleWishlist, getFeaturedPackages,
} from '../controllers/package.controller.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', getPackages);
router.get('/featured', getFeaturedPackages);
router.get('/:id', getPackageById);
router.post('/', protect, adminOnly, createPackage);
router.put('/:id', protect, adminOnly, updatePackage);
router.delete('/:id', protect, adminOnly, deletePackage);
router.post('/:id/wishlist', protect, toggleWishlist);

export default router;
