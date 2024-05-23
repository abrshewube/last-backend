const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: {
    type: String,
    enum: ['student', 'teacher', 'registrar', 'admin'],
    default: 'student'
  },
  grade: {
    type: Number,
    required: function() { return this.role === 'student'; }
  },
  classSection: { type: String, enum: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'] },
  familyPhoneNumber: { type: String },
  familyEmail: { type: String },
  assignedTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  profilePicture: String,
  email: { type: String, required: true, unique: true },
  schoolIdPhoto: { type: String, required: true },
  registrationStatus: { type: String, enum: ['pending', 'approved', 'denied'], default: 'pending' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
