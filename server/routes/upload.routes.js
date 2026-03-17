import express from 'express';
import { upload, uploadBufferToCloudinary, hasAllowedImageSignature } from '../middleware/upload.middleware.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';
import { createRateLimiter } from '../middleware/rateLimit.middleware.js';

const router = express.Router();

const uploadLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many upload attempts. Please try later.' },
});

// Upload one or more images to Cloudinary (admin only)
router.post('/', protect, adminOnly, uploadLimiter, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
    }

    const invalidFile = req.files.find((file) => !hasAllowedImageSignature(file.buffer));
    if (invalidFile) {
      return res.status(400).json({ success: false, message: 'Invalid image content detected' });
    }

    const uploaded = await Promise.all(
      req.files.map((file) => uploadBufferToCloudinary(file.buffer, 'ghumfir/packages'))
    );

    res.json({
      success: true,
      message: 'Images uploaded to Cloudinary',
      images: uploaded,            // [{ url, public_id }, ...]
      url: uploaded[0]?.url,       // single-image convenience
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ success: false, message: 'Image upload failed. Please try again.' });
  }
});

export default router;
