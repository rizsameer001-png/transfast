import express from 'express';
import { submitKYC, getKYCStatus } from '../controllers/kyc.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/submit', protect, submitKYC);
router.get('/status', protect, getKYCStatus);

export default router;
