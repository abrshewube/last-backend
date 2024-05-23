const express = require('express');
const router = express.Router();
const userController = require('../controller/user.controller');
const authMiddleware = require('../middleware/auth.middleware');
const multer = require('multer');

// Multer configuration for file upload
const storage = multer.diskStorage({});
const upload = multer({ storage });

// Register endpoint
router.post('/register', upload.fields([{ name: 'profilePicture' }, { name: 'schoolIdPhoto' }]), userController.register);

// Login endpoint
router.post('/login', userController.login);

// Endpoint to upload profile picture
router.post('/upload-profile-picture', authMiddleware.authenticateToken, upload.single('profilePicture'), userController.uploadProfilePicture);

// Endpoint to update profile
router.put('/update-profile', authMiddleware.authenticateToken, upload.single('profilePicture'), userController.updateProfile);

// Endpoint to delete user (restricted to admin role)
router.delete('/:id', authMiddleware.authenticateToken, userController.deleteUser);

// Endpoint to get user ID from token
router.get('/getUserId', authMiddleware.authenticateToken, userController.getUserId);

// Endpoint to get all users (for admin)
router.get('/all', authMiddleware.authenticateToken, authMiddleware.isAdmin, userController.getAllUsers);

// Endpoint to update user role (for admin)
router.put('/:id/update-role', authMiddleware.authenticateToken, authMiddleware.isAdmin, userController.updateUserRole);

// Endpoint to assign a teacher to a specific grade level and section (restricted to admin role)
router.post('/assign-teacher', authMiddleware.authenticateToken, authMiddleware.isAdmin, userController.assignTeacher);

// Endpoint to approve registration (restricted to admin role)
router.put('/approve/:id', authMiddleware.authenticateToken, authMiddleware.isAdmin, userController.approveRegistration);

// Endpoint to deny registration (restricted to admin role)
router.put('/deny/:id', authMiddleware.authenticateToken, authMiddleware.isAdmin, userController.denyRegistration);

// Endpoint to get uregistered users
router.get('/unregistered-students', authMiddleware.authenticateToken, authMiddleware.isAdmin, userController.getPendingRegistrations);
module.exports = router;
