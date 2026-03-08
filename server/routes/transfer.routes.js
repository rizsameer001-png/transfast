import express from 'express';
import { initiateTransfer, getUserTransactions, getTransaction, cancelTransaction, getTransferQuote } from '../controllers/transfer.controller.js';
import { protect, requireKYC } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/quote', protect, getTransferQuote);
router.post('/', protect, requireKYC, initiateTransfer);
router.get('/', protect, getUserTransactions);
router.get('/:id', protect, getTransaction);
router.put('/:id/cancel', protect, cancelTransaction);

export default router;
