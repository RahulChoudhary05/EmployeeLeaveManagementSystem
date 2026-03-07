const express = require('express');
const { body } = require('express-validator');
const { protect, authorize } = require('../middleware/auth.middleware');
const {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  getLeaveById,
  reviewLeave,
  deleteLeave,
  getLeaveStats,
} = require('../controllers/leave.controller');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Validation for applying leave
const applyLeaveValidation = [
  body('leaveType').notEmpty().withMessage('Leave type is required'),
  body('startDate')
    .notEmpty().withMessage('Start date is required')
    .isISO8601().withMessage('Start date must be a valid date'),
  body('endDate')
    .notEmpty().withMessage('End date is required')
    .isISO8601().withMessage('End date must be a valid date'),
  body('reason')
    .trim()
    .notEmpty().withMessage('Reason is required')
    .isLength({ min: 10 }).withMessage('Reason must be at least 10 characters')
    .isLength({ max: 500 }).withMessage('Reason cannot exceed 500 characters'),
];

// ─── Stats route ──────────────────────────────────────────────────────────────
router.get('/stats', getLeaveStats);

// ─── Employee routes ──────────────────────────────────────────────────────────
router.post('/', authorize('employee'), applyLeaveValidation, applyLeave);
router.get('/my', authorize('employee'), getMyLeaves);

// ─── Employer routes ──────────────────────────────────────────────────────────
router.get('/', authorize('employer'), getAllLeaves);

// ─── Shared routes ────────────────────────────────────────────────────────────
router.get('/:id', getLeaveById);
router.patch('/:id/review', authorize('employer'), reviewLeave);
router.delete('/:id', authorize('employee'), deleteLeave);

module.exports = router;
