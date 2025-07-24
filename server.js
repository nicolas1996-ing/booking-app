const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000'
}));

// Rate limiting - 100 requests per 15 minutes
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // max 100 requests per window
  message: {
    error: 'Too many requests from this IP, please try again later.'
  }
});
app.use(limiter);

// JSON parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Import routes
const roomsRoutes = require('./routes/rooms');

// Use routes
app.use('/api/rooms', roomsRoutes);

// Health check route - if the health check route is requested, return a message
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    service: 'Hotel Room Management System - Matecaña Airport'
  });
});

// Root route - if the root route is requested, return a message
app.get('/', (req, res) => {
  res.json({
    message: 'Hotel Room Management System - Matecaña Airport',
    version: '1.0.0',
    endpoints: {
      rooms: '/api/rooms',
      health: '/health'
    }
  });
});

// Error handling middleware - if an error occurs, return a 500 error
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 middleware - if the route is not found, return a 404 error
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.originalUrl
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Hotel Room Management System server started on port ${PORT}`);
  console.log(`Available endpoints:`);
  console.log(`   - Rooms: http://localhost:${PORT}/api/rooms`);
  console.log(`   - Health: http://localhost:${PORT}/health`);
});

module.exports = app;
