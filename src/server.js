const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Import routes and controllers
const connectDB = require('./config/database');
const seedCategories = require('./config/seedCategories');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const publicRoutes = require('./routes/publicRoutes');
const adRoutes = require('./routes/adRoutes');

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
const allowedOrigins = [process.env.CLIENT_ORIGIN || 'http://localhost:5173'];
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (curl, mobile apps)
      if (!origin) return callback(null, true);
      return allowedOrigins.includes(origin)
        ? callback(null, true)
        : callback(new Error('Not allowed by CORS'));
    },
    credentials: true
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/users', userRoutes);
app.use('/admin', adminRoutes);
app.use('/category', categoryRoutes);
app.use('/api/auth', authRoutes);
app.use('/public', publicRoutes);
app.use('/ads', adRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({
    message: 'Account Rental Backend API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth'
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error'
  });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`🚀 Server is running on port ${PORT}`);
  console.log(`🌎 Environment: ${process.env.NODE_ENV}`);
  console.log(`========================================\n`);
});

// Seed default categories on startup (idempotent)
seedCategories().catch((err) => {
  console.error('Category seeding failed:', err?.message || err);
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
  });
});
