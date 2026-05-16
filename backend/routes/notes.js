const express = require('express');
const router = express.Router();
const Notes = require('../models/Notes');
const { protect } = require('../middleware/auth');

// ─── GET GLOBAL NOTES ─────────────────────────────────────────────────
router.get('/', protect, async (req, res, next) => {
  try {
    let notes = await Notes.findOne({ userId: req.user._id });
    if (!notes) {
      notes = await Notes.create({ userId: req.user._id, content: '' });
    }
    res.json({ content: notes.content, updatedAt: notes.updatedAt });
  } catch (error) {
    next(error);
  }
});

// ─── SAVE GLOBAL NOTES ───────────────────────────────────────────────
router.put('/', protect, async (req, res, next) => {
  try {
    const { content } = req.body;

    let notes = await Notes.findOne({ userId: req.user._id });
    if (!notes) {
      notes = await Notes.create({ userId: req.user._id, content });
    } else {
      notes.content = content;
      await notes.save();
    }

    res.json({ message: 'Notes saved', updatedAt: notes.updatedAt });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
