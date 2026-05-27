const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
require('dotenv').config();

// Import routes
const authRoutes = require('./routes/authRoutes');
const foodRoutes = require('./routes/foodRoutes');
const cartRoutes = require('./routes/cartRoutes');
const reviewRoutes = require('./routes/reviewRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const emailRoutes = require('./routes/emailRoutes');

// Connect to database
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/foods', foodRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/email', emailRoutes);
app.use('/api/marketing', emailRoutes); // Marketing routes (same controller)

// Debug: Log all registered routes
console.log('\n📋 Registered Routes:');
console.log('  POST /api/marketing/send-offer - Launch email campaign');
console.log('  GET  /api/marketing/test - Test route');
console.log('  POST /api/marketing/unsubscribe - Unsubscribe from emails\n');

// Health check route
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Food E-commerce API is running',
    timestamp: new Date().toISOString()
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler - must be after all routes
app.use('*', (req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    message: 'Route not found',
    path: req.originalUrl,
    method: req.method
  });
});

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Database: ${process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/foodEcommerceDB'}`);
  console.log(`API Routes:`);
  console.log(`  - GET /api/reviews - Get all public reviews`);
  console.log(`  - GET /api/reviews/food/:foodId - Get reviews for a food item`);
  console.log(`  - POST /api/reviews - Create a review (protected)`);
  console.log(`  - POST /api/marketing/send-offer - Launch email campaign (admin only)`);
  console.log(`  - POST /api/email/send-marketing - Send marketing emails (admin only)`);
});
