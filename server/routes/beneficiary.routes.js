import express from 'express';
import { getBeneficiaries, addBeneficiary, updateBeneficiary, deleteBeneficiary } from '../controllers/beneficiary.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', protect, getBeneficiaries);
router.post('/', protect, addBeneficiary);
router.put('/:id', protect, updateBeneficiary);
router.delete('/:id', protect, deleteBeneficiary);

export default router;
