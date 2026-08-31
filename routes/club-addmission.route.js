const express = require('express');
const router = express.Router();
const clubApplicationController = require('../controller/club-addmison.controller');
const { authenticateToken, isClubAdmin } = require('../middleware/auth.middleware');

// Apply for a club
router.post('/apply', authenticateToken, clubApplicationController.applyForClub);

// Get club applications for a specific club (accessible only to club admins)
router.get('/:clubId/applications', authenticateToken, isClubAdmin, clubApplicationController.getClubApplications);

// Approve or deny a club application (accessible only to club admins)
router.put('/applications/:applicationId', authenticateToken, isClubAdmin, clubApplicationController.processClubApplication);

// Get user's club applications and their status
router.get('/user-applications', authenticateToken, clubApplicationController.getUserApplications);
module.exports = router;
