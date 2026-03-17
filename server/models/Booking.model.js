import mongoose from 'mongoose';
import { sanitizeText } from '../utils/sanitizeText.js';

const bookingSchema = new mongoose.Schema(
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
    travelDate: {
      type: Date,
      required: [true, 'Travel date is required'],
    },
    numberOfPeople: {
      type: Number,
      required: [true, 'Number of people is required'],
      min: 1,
    },
    totalPrice: {
      type: Number,
      required: true,
    },
    paymentMethod: {
      type: String,
      enum: ['khalti', 'card', 'cash'],
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
    },
    bookingStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },
    khaltiTransactionId: {
      type: String,
      default: '',
    },
    specialRequests: {
      type: String,
      default: '',
    },
    contactPhone: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

bookingSchema.pre('validate', function (next) {
  if (typeof this.contactPhone === 'string') this.contactPhone = sanitizeText(this.contactPhone, { maxLength: 30 });
  if (typeof this.specialRequests === 'string') this.specialRequests = sanitizeText(this.specialRequests, { maxLength: 1000 });
  if (typeof this.khaltiTransactionId === 'string') this.khaltiTransactionId = sanitizeText(this.khaltiTransactionId, { maxLength: 120 });
  next();
});

export default mongoose.model('Booking', bookingSchema);
