import express from 'express';
import {
  getDashboardStats, getAllUsers, toggleUserStatus,
  getAllTransactions, updateTransactionStatus,
  reviewKYC, getAllKYC, getAuditLogs
} from '../controllers/admin.controller.js';
import { protect, authorize } from '../middleware/auth.middleware.js';

const router = express.Router();

const adminAccess = [protect, authorize('admin', 'compliance', 'support')];

router.get('/dashboard', ...adminAccess, getDashboardStats);
router.get('/users', ...adminAccess, getAllUsers);
router.put('/users/:id/status', ...adminAccess, updateTransactionStatus, toggleUserStatus);
router.get('/transactions', ...adminAccess, getAllTransactions);
router.put('/transactions/:id/status', ...adminAccess, updateTransactionStatus);
router.get('/kyc', ...adminAccess, getAllKYC);
router.put('/kyc/:id/review', ...adminAccess, reviewKYC);
router.get('/audit-logs', protect, authorize('admin'), getAuditLogs);

export default router;
