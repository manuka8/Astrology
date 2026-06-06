const express = require('express');
const router = express.Router();
const { protect, admin, isExpert, hasPermission } = require('../middleware/authMiddleware');
const { expertUpload } = require('../middleware/upload');
const {
    submitApplication, checkStatus, loginTempAccount, getTempApplication,
    createRequest, getMyRequests, getMyRequest, cancelRequest,
    getQueue, acceptRequest, submitReview, getMyWork, getMyProfile, updateMyProfile,
    getApplications, approveApplication, rejectApplication, updateApplicationStatus, getExperts, getAllRequests,
} = require('../controllers/expertController');

// Public
router.post('/apply', expertUpload, submitApplication);
router.get('/status', checkStatus);
router.post('/temp-login', loginTempAccount);
router.get('/temp-application', getTempApplication);

// User (any authenticated user)
router.post('/requests', protect, createRequest);
router.get('/requests/my', protect, getMyRequests);
router.get('/requests/my/:id', protect, getMyRequest);
router.delete('/requests/my/:id', protect, cancelRequest);

// Expert only
router.get('/queue', protect, isExpert, getQueue);
router.post('/requests/:id/accept', protect, isExpert, acceptRequest);
router.put('/requests/:id/review', protect, isExpert, submitReview);
router.get('/my-work', protect, isExpert, getMyWork);
router.get('/my-profile', protect, isExpert, getMyProfile);
router.put('/my-profile', protect, isExpert, updateMyProfile);

// Admin — read intake
router.get('/applications', protect, admin, hasPermission('expert.read_intake'), getApplications);
router.put('/applications/:id/approve', protect, admin, hasPermission('expert.approve_reject'), approveApplication);
router.put('/applications/:id/reject', protect, admin, hasPermission('expert.approve_reject'), rejectApplication);
router.put('/applications/:id/status', protect, admin, hasPermission('expert.approve_reject'), updateApplicationStatus);
router.get('/list', protect, admin, getExperts);
router.get('/all-requests', protect, admin, getAllRequests);

module.exports = router;
