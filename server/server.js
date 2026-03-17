import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';
import session from 'express-session';
import crypto from 'crypto';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import './config/passport.js'; // registers Google strategy as side-effect
import passport from 'passport';
import authRoutes from './routes/auth.routes.js';
import packageRoutes from './routes/package.routes.js';
import bookingRoutes from './routes/booking.routes.js';
import reviewRoutes from './routes/review.routes.js';
import userRoutes from './routes/user.routes.js';
import paymentRoutes from './routes/payment.routes.js';
import uploadRoutes from './routes/upload.routes.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: join(__dirname, '.env') });

const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
].filter(Boolean);

// Security headers (X-Content-Type-Options, X-Frame-Options, HSTS, etc.)
app.use(helmet());

// Prevent NoSQL injection via sanitisation of req.body / req.query / req.params
app.use(mongoSanitize());

// Session — used only for the transient OAuth handshake; not for API authentication
app.use(session({
  secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 10 * 60 * 1000, // 10 minutes — just enough for OAuth redirect round-trip
  },
}));
app.use(passport.initialize());
app.use(passport.session());

// Middleware
app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);

    const isAllowed = allowedOrigins.includes(origin)
      || /^http:\/\/localhost:\d+$/.test(origin)
      || /^http:\/\/127\.0\.0\.1:\d+$/.test(origin);

    if (isAllowed) return callback(null, true);
    return callback(new Error(`CORS blocked for origin: ${origin}`));
  },
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
// Routes
app.use('/api/auth', authRoutes);
app.use('/api/packages', packageRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/users', userRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/upload', uploadRoutes);

app.get('/', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Ghumfir backend is running',
    health: '/api/health',
  });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Ghumfir API is running' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// Connect to MongoDB and start server
const preferredPort = Number(process.env.PORT) || 8080;
const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('❌ MONGO_URI is missing. Add it to server/.env');
  process.exit(1);
}

mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(`✅ MongoDB connected: ${mongoose.connection.host}/${mongoose.connection.name}`);

    const startServer = (port) => {
      const server = app.listen(port, () => {
        if (port !== preferredPort) {
          console.warn(`⚠️ Port ${preferredPort} was busy, switched to ${port}`);
        }
        console.log(`🚀 Ghumfir server running on port ${port}`);
      });

      server.on('error', (err) => {
        if (err.code === 'EADDRINUSE') {
          startServer(port + 1);
          return;
        }

        console.error('❌ Server startup error:', err.message);
        process.exit(1);
      });
    };

    startServer(preferredPort);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  });
