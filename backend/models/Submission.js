const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    default: null
  },
  problemId: {
    type: String,
    required: true, // The string slug/id, handy for fast lookups
  },
  language: {
    type: String,
    required: true,
    enum: ['java', 'python', 'cpp'],
  },
  code: {
    type: String,
    required: true,
  },
  mode: {
    type: String,
    enum: ['run', 'submit'],
    required: true,
  },
  status: {
    type: String,
    enum: [
      'accepted', 
      'wrong_answer', 
      'compile_error', 
      'runtime_error', 
      'time_limit_exceeded', 
      'error'
    ],
    required: true,
  },
  passedCount: {
    type: Number,
    default: 0
  },
  totalCount: {
    type: Number,
    default: 0
  },
  runtime: {
    type: Number, // Execution time in ms/s, can be max runtime of testcases
    default: 0
  },
  memory: {
    type: Number, // Memory in KB
    default: 0
  },
  testResults: {
    type: [{
      passed: Boolean,
      input: String,
      expectedOutput: String,
      actualOutput: String,
      status: String,
      runtime: String,
      memory: Number,
      errorOutput: String
    }],
    default: []
  }
}, {
  timestamps: true
});

submissionSchema.index({ user: 1, problemId: 1 });
submissionSchema.index({ createdAt: -1 });

const Submission = mongoose.model('Submission', submissionSchema);
module.exports = Submission;
