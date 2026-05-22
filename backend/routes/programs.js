const express = require('express');
const {
  getPrograms,
  getProgram,
  createProgram,
  updateProgram,
  deleteProgram
} = require('../controllers/programController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.use(protect); // All program routes require authentication

router
  .route('/')
  .get(getPrograms)
  .post(createProgram);

router
  .route('/:id')
  .get(getProgram)
  .put(updateProgram)
  .delete(deleteProgram);

module.exports = router;
