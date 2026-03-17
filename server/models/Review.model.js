import mongoose from 'mongoose';
import { sanitizeText } from '../utils/sanitizeText.js';

const reviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    package: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Package',
      required: true,
    },
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: [true, 'Review comment is required'],
      trim: true,
    },
  },
  { timestamps: true }
);

reviewSchema.pre('validate', function (next) {
  if (typeof this.comment === 'string') {
    this.comment = sanitizeText(this.comment, { maxLength: 1200 });
  }
  next();
});

// One review per booking
reviewSchema.index({ booking: 1 }, { unique: true });

// Update package rating after review save/delete
reviewSchema.statics.calcAverageRating = async function (packageId) {
  const stats = await this.aggregate([
    { $match: { package: packageId } },
    {
      $group: {
        _id: '$package',
        avgRating: { $avg: '$rating' },
        numReviews: { $sum: 1 },
      },
    },
  ]);

  const Package = mongoose.model('Package');
  if (stats.length > 0) {
    await Package.findByIdAndUpdate(packageId, {
      rating: Math.round(stats[0].avgRating * 10) / 10,
      numReviews: stats[0].numReviews,
    });
  } else {
    await Package.findByIdAndUpdate(packageId, { rating: 0, numReviews: 0 });
  }
};

reviewSchema.post('save', function () {
  this.constructor.calcAverageRating(this.package);
});

reviewSchema.post('deleteOne', { document: true, query: false }, function () {
  this.constructor.calcAverageRating(this.package);
});

export default mongoose.model('Review', reviewSchema);
