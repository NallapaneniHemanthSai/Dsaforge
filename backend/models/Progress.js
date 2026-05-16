const mongoose = require('mongoose');

const problemProgressSchema = new mongoose.Schema({
  problemId: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['unsolved', 'attempted', 'solved'],
    default: 'unsolved'
  },
  code: {
    type: String,
    default: ''
  },
  note: {
    type: String,
    default: ''
  },
  bookmarked: {
    type: Boolean,
    default: false
  },
  solvedAt: {
    type: Date,
    default: null
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { _id: false });

const progressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  problems: {
    type: [problemProgressSchema],
    default: []
  }
}, {
  timestamps: true
});

// Index for fast lookups
progressSchema.index({ 'problems.problemId': 1 });

const Progress = mongoose.model('Progress', progressSchema);
module.exports = Progress;
