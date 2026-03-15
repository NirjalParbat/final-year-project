import mongoose from 'mongoose';

const itinerarySchema = new mongoose.Schema({
  day: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  accommodation: { type: String, default: '' },
  meals: { type: String, default: '' },
});

const packageSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Package title is required'],
      trim: true,
    },
    destination: {
      type: String,
      required: [true, 'Destination is required'],
      trim: true,
    },
    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
    },
    category: {
      type: String,
      enum: ['Adventure', 'Cultural', 'Beach', 'Mountain', 'City', 'Wildlife', 'Heritage', 'Pilgrimage'],
      required: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: 0,
    },
    currency: {
      type: String,
      default: 'NPR',
    },
    duration: {
      type: Number,
      required: [true, 'Duration in days is required'],
      min: 1,
    },
    maxPeople: {
      type: Number,
      required: [true, 'Max people allowed is required'],
      min: 1,
    },
    bookedSeats: {
      type: Number,
      default: 0,
    },
    images: [
      {
        url: String,
        public_id: String,
      },
    ],
    itinerary: [itinerarySchema],
    availableDates: [
      {
        type: Date,
      },
    ],
    rating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    numReviews: {
      type: Number,
      default: 0,
    },
    highlights: [String],
    includes: [String],
    excludes: [String],
    isActive: {
      type: Boolean,
      default: true,
    },
    featured: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// Virtual: available seats
packageSchema.virtual('availableSeats').get(function () {
  return this.maxPeople - this.bookedSeats;
});

packageSchema.set('toJSON', { virtuals: true });

export default mongoose.model('Package', packageSchema);
