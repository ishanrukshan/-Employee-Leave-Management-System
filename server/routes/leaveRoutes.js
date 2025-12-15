import express from 'express';
import {
  applyLeave,
  getMyLeaves,
  getAllLeaves,
  approveLeave,
  rejectLeave,
  getAuditLogs,
} from '../controllers/leaveController.js';
import { protect, admin } from '../middleware/auth.js';
import { leaveValidation } from '../middleware/validators.js';

const router = express.Router();

// Employee routes
router.post('/', protect, leaveValidation, applyLeave);
router.get('/', protect, getMyLeaves);

// Admin routes
router.get('/all', protect, admin, getAllLeaves);
router.get('/audit-logs', protect, admin, getAuditLogs);
router.put('/:id/approve', protect, admin, approveLeave);
router.put('/:id/reject', protect, admin, rejectLeave);

export default router;
