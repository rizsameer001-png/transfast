import KYC from '../models/KYC.model.js';
import User from '../models/User.model.js';

// @desc    Submit KYC
export const submitKYC = async (req, res) => {
  try {
    const existingKYC = await KYC.findOne({ user: req.user._id });
    if (existingKYC && existingKYC.status === 'approved') {
      return res.status(400).json({ success: false, message: 'KYC already approved' });
    }
    
    const kycData = {
      ...req.body,
      user: req.user._id,
      status: 'under_review',
      submittedAt: new Date()
    };
    
    let kyc;
    if (existingKYC) {
      kyc = await KYC.findOneAndUpdate({ user: req.user._id }, kycData, { new: true });
    } else {
      kyc = await KYC.create(kycData);
    }
    
    await User.findByIdAndUpdate(req.user._id, { kycStatus: 'submitted' });
    
    res.json({ success: true, message: 'KYC submitted for review', kyc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get KYC status
export const getKYCStatus = async (req, res) => {
  try {
    const kyc = await KYC.findOne({ user: req.user._id });
    res.json({ success: true, kyc, kycStatus: req.user.kycStatus });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
