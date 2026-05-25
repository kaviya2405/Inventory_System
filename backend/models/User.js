const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  storeName: {
    type: String,
    required: true,
    trim: true
  },
  profilePicture: {
    type: String,
    default: ''
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String
  },
  otpExpiry: {
    type: Date
  },
  // Settings fields
  settings: {
    monthlyRevenueGoal: {
      type: Number,
      default: 50000
    },
    dashboardDateRange: {
      type: String,
      enum: ['7', '30', '90'],
      default: '30'
    },
    currency: {
      type: String,
      enum: ['USD', 'EUR', 'GBP', 'INR'],
      default: 'INR'
    },
    timezone: {
      type: String,
      default: 'UTC+5.5'
    },
    dateFormat: {
      type: String,
      enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'],
      default: 'DD/MM/YYYY'
    },
    notifications: {
      purchaseOrderConfirmation: {
        type: Boolean,
        default: true
      },
      dailySalesSummary: {
        type: Boolean,
        default: false
      },
      unusualSalesSpike: {
        type: Boolean,
        default: true
      }
    },
    isOnboardingComplete: {
      type: Boolean,
      default: false
    }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('User', userSchema);
