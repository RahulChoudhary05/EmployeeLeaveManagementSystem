const express = require('express');
const { protect, authorize } = require('../middleware/auth.middleware');
const { getAllEmployees, getProfile, updateProfile } = require('../controllers/user.controller');

const router = express.Router();

router.use(protect);

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.get('/employees', authorize('employer'), getAllEmployees);

module.exports = router;
