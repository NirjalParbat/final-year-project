# 🏔️ Ghumfir - Tourism Management Platform

A full-stack MERN tourism platform built for Nepal and beyond.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | Node.js + Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Payments | Khalti + Simulated Card |

## Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or Atlas)

### 1. Clone & Install
```bash
git clone <repo-url>
cd ghumfir
npm run install:all
```

### 2. Configure Environment
```bash
cp server/.env.example server/.env
# Edit server/.env with your MongoDB URI and other keys
```

### 3. Seed Database (admin + sample packages)
```bash
npm run seed
```

### 4. Run Development
```bash
npm run dev
```

Access:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000/api

## Default Admin Login
- **Email**: admin@ghumfir.com
- **Password**: admin123

## Project Structure
```
ghumfir/
├── server/                 # Express.js Backend
│   ├── controllers/        # Route handlers
│   ├── models/             # Mongoose models
│   ├── routes/             # API routes
│   ├── middleware/         # Auth middleware
│   ├── utils/              # Helper utilities
│   └── server.js           # Entry point
└── client/                 # React Frontend
    └── src/
        ├── api/            # Axios API layer
        ├── components/     # Reusable components
        ├── context/        # Auth context
        ├── layouts/        # Page layouts
        └── pages/          # Route pages
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Register user |
| POST | /api/auth/login | Login |
| GET | /api/packages | Get all packages |
| GET | /api/packages/:id | Package detail |
| POST | /api/bookings | Create booking |
| GET | /api/bookings/my | My bookings |
| POST | /api/reviews | Submit review |

## Features
- ✅ JWT Authentication (User + Admin)
- ✅ Tour Package CRUD
- ✅ Advanced Search & Filter
- ✅ Wishlist Management
- ✅ Booking System with Overbooking Prevention
- ✅ Multiple Payment Methods (Khalti, Card, Cash)
- ✅ Review System
- ✅ Admin Dashboard with Stats
- ✅ Responsive Tailwind UI
