const express = require('express');
const router = express.Router();
const { getPlans, getAllPlans, createPlan, updatePlan, deletePlan, subscribe, getSubscriptions, getAllSubscriptions } = require('../controllers/membershipController');
const { protect, admin } = require('../middleware/authMiddleware');

router.get('/plans', getPlans);
router.post('/subscribe', protect, subscribe);
router.get('/my-subscriptions', protect, getSubscriptions);
router.get('/admin/plans', protect, admin, getAllPlans);
router.post('/admin/plans', protect, admin, createPlan);
router.put('/admin/plans/:id', protect, admin, updatePlan);
router.delete('/admin/plans/:id', protect, admin, deletePlan);
router.get('/admin/subscriptions', protect, admin, getAllSubscriptions);

module.exports = router;
