const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  filename: String,
  originalName: String,
  mimetype: String,
  size: Number,
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  uploadDate: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('File', fileSchema);