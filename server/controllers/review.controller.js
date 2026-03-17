import Review from '../models/Review.model.js';
import Booking from '../models/Booking.model.js';

// @desc    Create review
// @route   POST /api/reviews
export const createReview = async (req, res) => {
  try {
    const { packageId, bookingId, rating, comment } = req.body;

    // Check booking exists and is completed/confirmed
    const booking = await Booking.findById(bookingId);
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found' });
    if (booking.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    if (!['confirmed', 'completed'].includes(booking.bookingStatus)) {
      return res.status(400).json({ success: false, message: 'Can only review confirmed bookings' });
    }

    if (booking.package.toString() !== packageId.toString()) {
      return res.status(400).json({ success: false, message: 'Review package does not match booking package' });
    }

    // Check if already reviewed
    const existing = await Review.findOne({ booking: bookingId });
    if (existing) {
      return res.status(400).json({ success: false, message: 'You already reviewed this booking' });
    }

    const review = await Review.create({
      user: req.user._id,
      package: packageId,
      booking: bookingId,
      rating,
      comment,
    });

    await review.populate('user', 'name avatar');
    res.status(201).json({ success: true, message: 'Review submitted', review });
  } catch (error) {
    console.error('createReview error:', error);
    res.status(500).json({ success: false, message: 'Failed to submit review.' });
  }
};

// @desc    Get reviews for a package
// @route   GET /api/reviews/package/:packageId
export const getPackageReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ package: req.params.packageId })
      .populate('user', 'name avatar')
      .sort('-createdAt');
    res.json({ success: true, reviews });
  } catch (error) {
    console.error('getPackageReviews error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
  }
};

// @desc    Delete review (admin)
// @route   DELETE /api/reviews/:id
export const deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found' });
    await review.deleteOne();
    res.json({ success: true, message: 'Review deleted' });
  } catch (error) {
    console.error('deleteReview error:', error);
    res.status(500).json({ success: false, message: 'Failed to delete review.' });
  }
};

// @desc    Get all reviews (admin)
// @route   GET /api/reviews/admin/all
export const getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name email')
      .populate('package', 'title destination')
      .sort('-createdAt');
    res.json({ success: true, reviews });
  } catch (error) {
    console.error('getAllReviews error:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch reviews.' });
  }
};
