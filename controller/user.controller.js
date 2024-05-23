const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cloudinary = require('cloudinary').v2; // Import Cloudinary
const User = require('../model/user.model');
const nodemailer = require('nodemailer');

// Initialize Cloudinary
cloudinary.config({
  cloud_name: 'dcixfqemc',
  api_key: '443894683639552',
  api_secret: 'bhj1-SWNgJSdjnFZE7Yv0jFqTMs'
});

// Configure Nodemailer
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'abrhamwube1@gmail.com',
    pass: 'bzpj czdo iynt izgg'
  }
});

// Function to register a new user
// Function to register a new user
async function register(req, res) {
  try {
    const { fullName, username, password, role, grade, email } = req.body;
    const profilePicture = req.files.profilePicture ? req.files.profilePicture[0] : null;
    const schoolIdPhoto = req.files.schoolIdPhoto ? req.files.schoolIdPhoto[0] : null;

    // Check if the username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Upload profile picture to Cloudinary
    let profilePictureUrl = '';
    if (profilePicture) {
      const result = await cloudinary.uploader.upload(profilePicture.path);
      profilePictureUrl = result.secure_url;
    }

    // Upload school ID photo to Cloudinary
    let schoolIdPhotoUrl = '';
    if (schoolIdPhoto) {
      const result = await cloudinary.uploader.upload(schoolIdPhoto.path);
      schoolIdPhotoUrl = result.secure_url;
    }

    // Create user with profile picture and school ID photo URLs
    const user = new User({
      fullName,
      username,
      password: hashedPassword,
      role,
      grade,
      email,
      profilePicture: profilePictureUrl,
      schoolIdPhoto: schoolIdPhotoUrl
    });

    await user.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}


// Function to upload profile picture
async function uploadProfilePicture(req, res) {
  try {
    // Check if file exists in request
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path);

    // Update user's profile picture URL in database
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    user.profilePicture = result.secure_url;
    await user.save();

    res.json({ message: 'Profile picture uploaded successfully', imageUrl: result.secure_url });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}

// Function to update user profile
async function updateProfile(req, res) {
  try {
    const { fullName, grade } = req.body;
    const profilePicture = req.file; // Uploaded profile picture file

    // Find user by ID
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Update user profile fields
    user.fullName = fullName;
    user.grade = grade;

    // Check if a new profile picture is uploaded
    if (profilePicture) {
      // Upload new profile picture to Cloudinary
      const result = await cloudinary.uploader.upload(profilePicture.path);
      user.profilePicture = result.secure_url;
    }

    await user.save();

    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}

// Function for user login
async function login(req, res) {
  try {
    const { username, password } = req.body;

    // Find user by username
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid username or password' });
    }

    // Generate JWT token
    const token = jwt.sign({
      username: user.username,
      role: user.role,
      fullName: user.fullName,
      _id: user._id,
      grade: user.grade,
      profilePicture: user.profilePicture
    }, 'secret');

    res.json({ token });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}

// Function to delete user (restricted to admin role)
async function deleteUser(req, res) {
  try {
    // Check if user making the request is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access Denied: Admin only' });
    }

    const userId = req.params.id;

    // Find user by ID and delete
    const deletedUser = await User.findByIdAndDelete(userId);
    if (!deletedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}

// Function to get user ID
async function getUserId(req, res) {
  try {
    // Assuming the decoded user object is stored in req.user by the authMiddleware
    const userId = req.user._id; // Assuming your User model has a field called '_id' for user ID
    console.log("userId", userId);
    res.json({ userId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}

// Function to get all users (for admin)
async function getAllUsers(req, res) {
  try {
    // Check if the user making the request is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access Denied: Admin only' });
    }

    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}

// Function to update user role (for admin)
async function updateUserRole(req, res) {
  try {
    // Check if the user making the request is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access Denied: Admin only' });
    }

    const userId = req.params.id;
    const { role } = req.body;

    // Find user by ID and update role
    const user = await User.findByIdAndUpdate(userId, { role }, { new: true });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User role updated successfully', user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}

// Function to assign a teacher to a specific grade level and section (for admin)
async function assignTeacher(req, res) {
  try {
    // Check if the user making the request is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access Denied: Admin only' });
    }

    const { teacherId, grade, section } = req.body;

    // Find teacher by ID and update assigned grade and section
    const teacher = await User.findByIdAndUpdate(teacherId, { assignedGrade: grade, assignedSection: section }, { new: true });

    if (!teacher) {
      return res.status(404).json({ message: 'Teacher not found' });
    }

    res.json({ message: 'Teacher assigned successfully', teacher });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}

// Function to get all teachers
async function getAllTeachers(req, res) {
  try {
    // Check if the user making the request is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access Denied: Admin only' });
    }

    const teachers = await User.find({ role: 'teacher' });
    res.json(teachers);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}

// Function to approve registration
async function approveRegistration(req, res) {
  try {
    const { id } = req.params;

    const registration = await User.findById(id);
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access Denied: Admin Role only' });
    }

    registration.registrationStatus = 'approved';
    await registration.save();

    const mailOptions = {
      from: 'your-email@gmail.com',
      to: registration.email,
      subject: 'Registration Approved',
      text: 'Your registration has been approved. You can now login using your credentials.'
    };
    transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Registration approved successfully', registration });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}

// Function to deny registration
async function denyRegistration(req, res) {
  try {
    const { id } = req.params;

    const registration = await User.findById(id);
    if (!registration) {
      return res.status(404).json({ message: 'Registration not found' });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access Denied: Admin Role only' });
    }

    registration.registrationStatus = 'denied';
    await registration.save();

    const mailOptions = {
      from: 'abrhamwube1@gmail.com',
      to: registration.email,
      subject: 'Registration Denied',
      text: 'Your registration has been denied. Please contact support for more information.'
    };
    transporter.sendMail(mailOptions);

    res.status(200).json({ message: 'Registration denied successfully', registration });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}

// Function to get users with registration status of 'pending'
async function getPendingRegistrations(req, res) {
  try {
    // Check if the user making the request is an admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access Denied: Admin only' });
    }

    const pendingRegistrations = await User.find({ registrationStatus: 'pending' });
    res.json(pendingRegistrations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error' });
  }
}
module.exports = { register, getPendingRegistrations,approveRegistration, denyRegistration, getAllUsers, updateUserRole, getUserId, uploadProfilePicture, updateProfile, login, deleteUser, assignTeacher, getAllTeachers };
