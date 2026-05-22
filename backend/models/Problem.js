const mongoose = require('mongoose');

const testCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  output: { type: String, required: true },
  explanation: { type: String, default: '' },
  isHidden: { type: Boolean, default: false }
});

const problemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true,
  },
  id: {
    type: String,
    required: true,
    unique: true, // e.g., 'two-sum'
    trim: true,
  },
  sheet: {
    type: String,
    required: true, // e.g., 'blind75'
  },
  section: {
    type: String,
    default: 'General'
  },
  topic: {
    type: String,
    required: true,
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true,
  },
  tags: {
    type: [String],
    default: []
  },
  externalLink: {
    type: String,
    default: ''
  },
  description: {
    type: String,
    required: true,
  },
  constraints: {
    type: [String],
    default: []
  },
  examples: {
    type: [{
      input: String,
      output: String,
      explanation: String
    }],
    default: []
  },
  starterCode: {
    type: Map,
    of: String,
    default: {
      java: 'class Solution {\n    // Write your code here\n}',
      python: 'class Solution:\n    # Write your code here\n    pass',
      cpp: 'class Solution {\npublic:\n    // Write your code here\n};'
    }
  },
  testCases: {
    type: [testCaseSchema],
    default: []
  },
  hiddenTestCases: {
    type: [testCaseSchema],
    default: []
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  },
  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null
  }
}, {
  timestamps: true
});

// Create compound indexes if needed for faster searches
problemSchema.index({ sheet: 1, topic: 1 });
problemSchema.index({ difficulty: 1 });

const Problem = mongoose.model('Problem', problemSchema);
module.exports = Problem;
