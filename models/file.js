const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  fileId: {
    type: String,
    required: true,
    unique: true
  },
  sequentialId: {
    type: Number,
    required: true
  },
  filename: String,
  originalName: String,
  mimetype: String,
  size: Number,
  data: {
    type: Buffer,
    required: true
  },
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

// Add a static method to get next sequential ID for a user
fileSchema.statics.getNextSequentialId = async function(userId) {
  const lastFile = await this.findOne({ uploadedBy: userId })
    .sort({ sequentialId: -1 });
  return lastFile ? lastFile.sequentialId + 1 : 1;
};

// Create and export the model
const File = mongoose.model('File', fileSchema);
module.exports = File;