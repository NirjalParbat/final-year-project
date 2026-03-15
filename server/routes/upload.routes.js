import express from 'express';
import { upload, uploadBufferToCloudinary } from '../middleware/upload.middleware.js';
import { protect, adminOnly } from '../middleware/auth.middleware.js';

const router = express.Router();

// Upload one or more images to Cloudinary (admin only)
router.post('/', protect, adminOnly, upload.array('images', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ success: false, message: 'No files uploaded' });
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
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;
