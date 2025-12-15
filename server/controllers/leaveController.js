import Leave from '../models/Leave.js';
import AuditLog from '../models/AuditLog.js';
import User from '../models/User.js';

//Apply for leave
//POST /api/leaves
const applyLeave = async (req, res) => {
  try {
    const { startDate, endDate, reason } = req.body;

    // Validate dates
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (end < start) {
      return res.status(400).json({ message: 'End date cannot be before start date' });
    }

    const leave = await Leave.create({
      employee: req.user._id,
      startDate: start,
      endDate: end,
      reason,
    });

    res.status(201).json(leave);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get logged in user's leaves
//GET /api/leaves
const getMyLeaves = async (req, res) => {
  try {
    const leaves = await Leave.find({ employee: req.user._id })
      .sort({ createdAt: -1 })
      .populate('approvedBy', 'name');

    res.json(leaves);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get all leaves (Admin)
// GET /api/leaves/all
const getAllLeaves = async (req, res) => {
  try {
    const { status } = req.query;
    
    let query = {};
    if (status && ['pending', 'approved', 'rejected'].includes(status)) {
      query.status = status;
    }

    const leaves = await Leave.find(query)
      .sort({ createdAt: -1 })
      .populate('employee', 'name email')
      .populate('approvedBy', 'name');

    res.json(leaves);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

//Approve leave request
//PUT /api/leaves/:id/approve
const approveLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ message: 'Leave request has already been processed' });
    }

    leave.status = 'approved';
    leave.approvedBy = req.user._id;
    leave.approvedAt = new Date();
    leave.adminComment = req.body.comment || '';

    await leave.save();

    // Create audit log
    const admin = await User.findById(req.user._id);
    await AuditLog.create({
      action: 'approved',
      performedBy: req.user._id,
      targetLeave: leave._id,
      details: `Admin ${admin.name} approved leave request "${leave.leaveId}" at ${new Date().toISOString()}`,
    });

    const populatedLeave = await Leave.findById(leave._id)
      .populate('employee', 'name email')
      .populate('approvedBy', 'name');

    res.json(populatedLeave);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

//Reject leave request
//PUT /api/leaves/:id/reject
const rejectLeave = async (req, res) => {
  try {
    const leave = await Leave.findById(req.params.id);

    if (!leave) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    if (leave.status !== 'pending') {
      return res.status(400).json({ message: 'Leave request has already been processed' });
    }

    leave.status = 'rejected';
    leave.approvedBy = req.user._id;
    leave.approvedAt = new Date();
    leave.adminComment = req.body.comment || '';

    await leave.save();

    // Create audit log
    const admin = await User.findById(req.user._id);
    await AuditLog.create({
      action: 'rejected',
      performedBy: req.user._id,
      targetLeave: leave._id,
      details: `Admin ${admin.name} rejected leave request "${leave.leaveId}" at ${new Date().toISOString()}`,
    });

    const populatedLeave = await Leave.findById(leave._id)
      .populate('employee', 'name email')
      .populate('approvedBy', 'name');

    res.json(populatedLeave);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

//Get audit logs
//GET /api/leaves/audit-logs
const getAuditLogs = async (req, res) => {
  try {
    const logs = await AuditLog.find()
      .sort({ timestamp: -1 })
      .populate('performedBy', 'name email')
      .populate({
        path: 'targetLeave',
        populate: { path: 'employee', select: 'name email' }
      })
      .limit(50);

    res.json(logs);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

export {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  approveLeave,
  rejectLeave,
  getAuditLogs,
};
