const mongoose = require('mongoose');

const examSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['quiz', 'mid', 'assignment', 'final'],
    required: true
  },
  weight: {
    type: Number,
    required: true
  },
  questions: {
    type: String, // Cloudinary file URL for the uploaded PDF
    required: true
  },
  
});

const Exam = mongoose.model('Exam', examSchema);

module.exports = Exam;
