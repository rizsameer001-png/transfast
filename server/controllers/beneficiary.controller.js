import Beneficiary from '../models/Beneficiary.model.js';

// @desc    Get user beneficiaries
export const getBeneficiaries = async (req, res) => {
  try {
    const beneficiaries = await Beneficiary.find({ owner: req.user._id, isActive: true })
      .sort({ lastUsed: -1, createdAt: -1 });
    res.json({ success: true, beneficiaries });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Add beneficiary
export const addBeneficiary = async (req, res) => {
  try {
    const beneficiary = await Beneficiary.create({ ...req.body, owner: req.user._id });
    res.status(201).json({ success: true, message: 'Beneficiary added', beneficiary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update beneficiary
export const updateBeneficiary = async (req, res) => {
  try {
    const beneficiary = await Beneficiary.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      req.body,
      { new: true, runValidators: true }
    );
    if (!beneficiary) return res.status(404).json({ success: false, message: 'Beneficiary not found' });
    res.json({ success: true, message: 'Beneficiary updated', beneficiary });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete beneficiary
export const deleteBeneficiary = async (req, res) => {
  try {
    const beneficiary = await Beneficiary.findOneAndUpdate(
      { _id: req.params.id, owner: req.user._id },
      { isActive: false },
      { new: true }
    );
    if (!beneficiary) return res.status(404).json({ success: false, message: 'Beneficiary not found' });
    res.json({ success: true, message: 'Beneficiary removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
