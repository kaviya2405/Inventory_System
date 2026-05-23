const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const morgan = require('morgan');
require('dotenv').config();
const connectDB = require('./config/database');

const salesRoutes = require('./routes/sales');
const predictionRoutes = require('./routes/predictions');
const billRoutes = require('./routes/bill');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

// Connect to MongoDB (no auto-initialization)
connectDB();

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('dev'));

// Static files for production
const path = require('path');

// API Routes - MUST come before static files
app.use('/api/auth', authRoutes);
app.use('/api/sales', salesRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/bill', billRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Inventory Intelligence Backend is running',
    timestamp: new Date().toISOString()
  });
});

// Serve static files - MUST come before catch-all route
app.use(express.static(path.join(__dirname, "../frontend/dist")));

// Catch-all for React router - MUST be last
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/dist", "index.html"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api`);
  console.log(`🏥 Health check: http://localhost:${PORT}/api/health`);
});

module.exports = app;
