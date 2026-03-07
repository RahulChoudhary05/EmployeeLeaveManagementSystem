const { validationResult } = require('express-validator');
const Leave = require('../models/Leave.model');

// ─── @route   POST /api/leaves ────────────────────────────────────────────────
// ─── @desc    Employee applies for leave ──────────────────────────────────────
// ─── @access  Private (employee) ──────────────────────────────────────────────
const applyLeave = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array(),
    });
  }

  const { leaveType, startDate, endDate, reason } = req.body;

  try {
    // Validate date range
    const start = new Date(startDate);
    const end = new Date(endDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (start < today) {
      return res.status(400).json({
        success: false,
        message: 'Start date cannot be in the past.',
      });
    }

    if (end < start) {
      return res.status(400).json({
        success: false,
        message: 'End date must be on or after start date.',
      });
    }

    // Check for overlapping leave requests
    const overlapping = await Leave.findOne({
      employee: req.user.id,
      status: { $ne: 'Rejected' },
      $or: [
        { startDate: { $lte: end }, endDate: { $gte: start } },
      ],
    });

    if (overlapping) {
      return res.status(409).json({
        success: false,
        message: 'You already have a leave request overlapping with these dates.',
      });
    }

    const leave = await Leave.create({
      employee: req.user.id,
      leaveType,
      startDate: start,
      endDate: end,
      reason,
    });

    await leave.populate('employee', 'name email department');

    res.status(201).json({
      success: true,
      message: 'Leave application submitted successfully!',
      data: { leave },
    });
  } catch (error) {
    console.error('Apply Leave Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while submitting leave.',
    });
  }
};

// ─── @route   GET /api/leaves/my ──────────────────────────────────────────────
// ─── @desc    Employee views their own leave applications ─────────────────────
// ─── @access  Private (employee) ──────────────────────────────────────────────
const getMyLeaves = async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const query = { employee: req.user.id };
    if (status) query.status = status;

    const total = await Leave.countDocuments(query);
    const leaves = await Leave.find(query)
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.status(200).json({
      success: true,
      data: {
        leaves,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get My Leaves Error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── @route   GET /api/leaves ─────────────────────────────────────────────────
// ─── @desc    Employer views all employee leave requests ──────────────────────
// ─── @access  Private (employer) ──────────────────────────────────────────────
const getAllLeaves = async (req, res) => {
  try {
    const { status, page = 1, limit = 20, search } = req.query;
    const query = {};
    if (status && status !== 'All') query.status = status;

    const total = await Leave.countDocuments(query);
    let leavesQuery = Leave.find(query)
      .populate('employee', 'name email department')
      .populate('reviewedBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const leaves = await leavesQuery;

    // Optional search by employee name (post-query filter)
    let filtered = leaves;
    if (search) {
      const s = search.toLowerCase();
      filtered = leaves.filter(
        (l) =>
          l.employee?.name?.toLowerCase().includes(s) ||
          l.employee?.email?.toLowerCase().includes(s)
      );
    }

    res.status(200).json({
      success: true,
      data: {
        leaves: filtered,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error) {
    console.error('Get All Leaves Error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── @route   GET /api/leaves/:id ─────────────────────────────────────────────
// ─── @desc    Get single leave request ────────────────────────────────────────
// ─── @access  Private ─────────────────────────────────────────────────────────
const getLeaveById = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id)
      .populate('employee', 'name email department')
      .populate('reviewedBy', 'name email');

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found.' });
    }

    // Employee can only view their own; employer can view all
    if (
      req.user.role === 'employee' &&
      leave.employee._id.toString() !== req.user.id
    ) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    res.status(200).json({ success: true, data: { leave } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── @route   PATCH /api/leaves/:id/review ────────────────────────────────────
// ─── @desc    Employer approves or rejects a leave request ────────────────────
// ─── @access  Private (employer) ──────────────────────────────────────────────
const reviewLeave = async (req, res) => {
  const { status, reviewNote } = req.body;

  if (!['Approved', 'Rejected'].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Status must be either 'Approved' or 'Rejected'.",
    });
  }

  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found.' });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: `Leave has already been ${leave.status.toLowerCase()}.`,
      });
    }

    leave.status = status;
    leave.reviewedBy = req.user.id;
    leave.reviewedAt = new Date();
    leave.reviewNote = reviewNote || '';

    await leave.save();
    await leave.populate('employee', 'name email department');
    await leave.populate('reviewedBy', 'name email');

    res.status(200).json({
      success: true,
      message: `Leave request ${status.toLowerCase()} successfully!`,
      data: { leave },
    });
  } catch (error) {
    console.error('Review Leave Error:', error);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── @route   DELETE /api/leaves/:id ──────────────────────────────────────────
// ─── @desc    Employee cancels a pending leave ────────────────────────────────
// ─── @access  Private (employee) ──────────────────────────────────────────────
const deleteLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found.' });
    }

    if (leave.employee.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (leave.status !== 'Pending') {
      return res.status(400).json({
        success: false,
        message: 'Only pending leave requests can be cancelled.',
      });
    }

    await leave.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Leave request cancelled successfully.',
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── @route   GET /api/leaves/stats ───────────────────────────────────────────
// ─── @desc    Get leave statistics ────────────────────────────────────────────
// ─── @access  Private ─────────────────────────────────────────────────────────
const getLeaveStats = async (req, res) => {
  try {
    let matchQuery = {};
    if (req.user.role === 'employee') {
      matchQuery = { employee: req.user._id };
    }

    const stats = await Leave.aggregate([
      { $match: matchQuery },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalDays: { $sum: '$totalDays' },
        },
      },
    ]);

    const result = {
      Pending: { count: 0, totalDays: 0 },
      Approved: { count: 0, totalDays: 0 },
      Rejected: { count: 0, totalDays: 0 },
    };

    stats.forEach((s) => {
      result[s._id] = { count: s.count, totalDays: s.totalDays || 0 };
    });

    const totalLeaves = await Leave.countDocuments(matchQuery);
    result.Total = { count: totalLeaves };

    res.status(200).json({ success: true, data: { stats: result } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  getLeaveById,
  reviewLeave,
  deleteLeave,
  getLeaveStats,
};
