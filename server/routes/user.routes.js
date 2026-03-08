import express from 'express';
import User from '../models/User.model.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

// GET /api/users/profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, user });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

// PUT /api/users/profile
router.put('/profile', protect, async (req, res) => {
  try {
    const allowedFields = ['firstName', 'lastName', 'phone', 'address', 'dateOfBirth', 'currency'];
    const updates = {};
    allowedFields.forEach(f => { if (req.body[f] !== undefined) updates[f] = req.body[f]; });
    
    const user = await User.findByIdAndUpdate(req.user._id, updates, { new: true, runValidators: true }).select('-password');
    res.json({ success: true, message: 'Profile updated', user });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

export default router;
