const User = require('../models/User.model');
const Leave = require('../models/Leave.model');

// ─── @route   GET /api/users/employees ────────────────────────────────────────
// ─── @desc    Employer gets list of all employees ─────────────────────────────
// ─── @access  Private (employer) ──────────────────────────────────────────────
const getAllEmployees = async (req, res) => {
  try {
    const employees = await User.find({ role: 'employee' }).select('-password').sort({ name: 1 });

    res.status(200).json({
      success: true,
      data: { employees, total: employees.length },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── @route   GET /api/users/profile ──────────────────────────────────────────
// ─── @desc    Get own profile ─────────────────────────────────────────────────
// ─── @access  Private ─────────────────────────────────────────────────────────
const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.status(200).json({ success: true, data: { user } });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// ─── @route   PUT /api/users/profile ──────────────────────────────────────────
// ─── @desc    Update own profile ──────────────────────────────────────────────
// ─── @access  Private ─────────────────────────────────────────────────────────
const updateProfile = async (req, res) => {
  const { name, department } = req.body;
  try {
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, department },
      { new: true, runValidators: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully!',
      data: { user },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { getAllEmployees, getProfile, updateProfile };
