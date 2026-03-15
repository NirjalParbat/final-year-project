import Booking from '../models/Booking.model.js';
import axios from 'axios';

// @desc    Verify Khalti payment
// @route   POST /api/payments/khalti/verify
export const verifyKhaltiPayment = async (req, res) => {
  try {
    const { token, amount, bookingId } = req.body;

    // Verify with Khalti API
    const response = await axios.post(
      'https://khalti.com/api/v2/payment/verify/',
      { token, amount },
      {
        headers: {
          Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
        },
      }
    );

    if (response.data.idx) {
      const booking = await Booking.findByIdAndUpdate(
        bookingId,
        {
          paymentStatus: 'paid',
          bookingStatus: 'confirmed',
          khaltiTransactionId: response.data.idx,
        },
        { new: true }
      );
      return res.json({ success: true, message: 'Payment verified', booking });
    }

    res.status(400).json({ success: false, message: 'Payment verification failed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Simulate card payment
// @route   POST /api/payments/card/simulate
export const simulateCardPayment = async (req, res) => {
  try {
    const { bookingId, cardNumber } = req.body;

    // Simulate payment processing (in real app, use Stripe etc.)
    if (!cardNumber || cardNumber.length < 16) {
      return res.status(400).json({ success: false, message: 'Invalid card details' });
    }

    const booking = await Booking.findByIdAndUpdate(
      bookingId,
      { paymentStatus: 'paid', bookingStatus: 'confirmed' },
      { new: true }
    );

    res.json({ success: true, message: 'Card payment successful', booking });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
