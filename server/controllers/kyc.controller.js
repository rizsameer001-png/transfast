// server/controllers/kyc.controller.js
import KYC from '../models/KYC.model.js';
import User from '../models/User.model.js';

// @desc    Submit KYC with optional file uploads
export const submitKYC = async (req, res) => {
  try {
    const existingKYC = await KYC.findOne({ user: req.user._id });
    if (existingKYC && existingKYC.status === 'approved') {
      return res.status(400).json({ success: false, message: 'KYC already approved' });
    }

    // Parse address if sent as JSON string (FormData sends everything as strings)
    let address = req.body.address;
    if (typeof address === 'string') {
      try { address = JSON.parse(address); } catch { address = {}; }
    }

    const kycData = {
      user:          req.user._id,
      dateOfBirth:   req.body.dateOfBirth,
      nationality:   req.body.nationality,
      occupation:    req.body.occupation,
      sourceOfFunds: req.body.sourceOfFunds,
      idType:        req.body.idType,
      idNumber:      req.body.idNumber,
      idExpiryDate:  req.body.idExpiryDate || undefined,
      address,
      status:        'under_review',
      submittedAt:   new Date(),
    };

    // Attach uploaded file paths (served via /uploads/...)
    if (req.files?.idFrontImage?.[0])   kycData.idFrontImage   = req.files.idFrontImage[0].path.replace(/\\/g, '/');
    if (req.files?.idBackImage?.[0])    kycData.idBackImage    = req.files.idBackImage[0].path.replace(/\\/g, '/');
    if (req.files?.selfieImage?.[0])    kycData.selfieImage    = req.files.selfieImage[0].path.replace(/\\/g, '/');
    if (req.files?.proofOfAddress?.[0]) kycData.proofOfAddress = req.files.proofOfAddress[0].path.replace(/\\/g, '/');

    // Keep existing images if no new ones uploaded (on resubmission)
    if (existingKYC) {
      if (!kycData.idFrontImage   && existingKYC.idFrontImage)   kycData.idFrontImage   = existingKYC.idFrontImage;
      if (!kycData.idBackImage    && existingKYC.idBackImage)     kycData.idBackImage    = existingKYC.idBackImage;
      if (!kycData.selfieImage    && existingKYC.selfieImage)     kycData.selfieImage    = existingKYC.selfieImage;
      if (!kycData.proofOfAddress && existingKYC.proofOfAddress)  kycData.proofOfAddress = existingKYC.proofOfAddress;
    }

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
