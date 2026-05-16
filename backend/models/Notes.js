const mongoose = require('mongoose');

const notesSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  content: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});


const Notes = mongoose.model('Notes', notesSchema);
module.exports = Notes;
