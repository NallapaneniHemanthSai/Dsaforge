const express = require('express');
const {
  runCode,
  submitCode,
  getProblemSubmissions,
  getSubmission
} = require('../controllers/submissionController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All submission routes require auth

router.post('/run', runCode);
router.post('/submit', submitCode);
router.get('/problem/:problemId', getProblemSubmissions);
router.get('/:id', getSubmission);

module.exports = router;
