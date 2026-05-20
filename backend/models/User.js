const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { ROLE_VALUES, ROLES } = require('../constants/roles');

const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ROLE_VALUES,
    default: ROLES.USER,
  },
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters']
  },
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    lowercase: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [20, 'Username cannot exceed 20 characters'],
    match: [/^[a-zA-Z0-9_]+$/, 'Username can only contain alphanumeric characters and underscores']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    match: [/^[a-zA-Z0-9._%+-]+@(kluniversity\.in|klu\.ac\.in)$/, 'Only KL University email addresses are allowed']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters']
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  otp: {
    type: String,
    default: null
  },
  otpExpiry: {
    type: Date,
    default: null
  },
  otpAttempts: {
    type: Number,
    default: 0
  },
  otpResendCount: {
    type: Number,
    default: 0
  },
  otpLockedUntil: {
    type: Date,
    default: null
  },
  resetToken: {
    type: String,
    default: null
  },
  resetTokenExpiry: {
    type: Date,
    default: null
  },
  refreshToken: {
    type: String,
    default: null
  },
  bio: {
    type: String,
    default: '',
    maxlength: [150, 'Bio cannot exceed 150 characters']
  },
  theme: {
    type: String,
    enum: ['light', 'dark', 'system'],
    default: 'system'
  },
  judgeApiKey: {
    type: String,
    default: ''
  },
  weeklyGoal: {
    type: Number,
    default: 7
  },
  emailNotifications: {
    type: Boolean,
    default: true
  },
  isDeleted: {
    type: Boolean,
    default: false
  },
  deletedAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

// Don't return sensitive fields in JSON
userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.password;
  delete user.otp;
  delete user.otpExpiry;
  delete user.otpAttempts;
  delete user.otpResendCount;
  delete user.otpLockedUntil;
  delete user.resetToken;
  delete user.resetTokenExpiry;
  delete user.refreshToken;
  delete user.__v;
  return user;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
