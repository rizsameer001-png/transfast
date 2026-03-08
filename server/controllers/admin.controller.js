import User from '../models/User.model.js';
import Transaction from '../models/Transaction.model.js';
import KYC from '../models/KYC.model.js';
import AuditLog from '../models/AuditLog.model.js';

// @desc    Admin dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const [
      totalUsers, activeUsers, totalTransactions, todayTransactions,
      pendingKYC, flaggedTransactions, totalVolume
    ] = await Promise.all([
      User.countDocuments({ role: 'user' }),
      User.countDocuments({ role: 'user', isActive: true }),
      Transaction.countDocuments(),
      Transaction.countDocuments({ createdAt: { $gte: today } }),
      KYC.countDocuments({ status: 'under_review' }),
      Transaction.countDocuments({ isFlagged: true, status: 'pending' }),
      Transaction.aggregate([
        { $match: { status: { $in: ['sent', 'delivered'] } } },
        { $group: { _id: null, total: { $sum: '$sendAmount' } } }
      ])
    ]);
    
    // Monthly transaction volume (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
    
    const monthlyVolume = await Transaction.aggregate([
      { $match: { createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 },
          volume: { $sum: '$sendAmount' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);
    
    // Status breakdown
    const statusBreakdown = await Transaction.aggregate([
      { $group: { _id: '$status', count: { $sum: 1 } } }
    ]);
    
    res.json({
      success: true,
      stats: {
        totalUsers,
        activeUsers,
        totalTransactions,
        todayTransactions,
        pendingKYC,
        flaggedTransactions,
        totalVolume: totalVolume[0]?.total || 0,
        monthlyVolume,
        statusBreakdown
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all users
export const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search, role, kycStatus, status } = req.query;
    
    const query = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;
    if (kycStatus) query.kycStatus = kycStatus;
    if (status === 'suspended') query.isSuspended = true;
    if (status === 'active') query.isActive = true;
    
    const total = await User.countDocuments(query);
    const users = await User.find(query)
      .select('-password -emailVerificationToken -passwordResetToken')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    res.json({ success: true, users, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Suspend/Activate user
export const toggleUserStatus = async (req, res) => {
  try {
    const { action, reason } = req.body;
    const user = await User.findById(req.params.id);
    
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    
    if (action === 'suspend') {
      user.isSuspended = true;
      user.suspendedReason = reason;
    } else if (action === 'activate') {
      user.isSuspended = false;
      user.isActive = true;
      user.suspendedReason = undefined;
    } else if (action === 'deactivate') {
      user.isActive = false;
    }
    
    await user.save();
    
    await AuditLog.create({
      actor: req.user._id,
      actorRole: req.user.role,
      action: `USER_${action.toUpperCase()}`,
      resource: 'User',
      resourceId: user._id.toString(),
      details: { reason },
      ipAddress: req.ip
    });
    
    res.json({ success: true, message: `User ${action}d successfully`, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all transactions (admin)
export const getAllTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, country, flagged, search } = req.query;
    
    const query = {};
    if (status) query.status = status;
    if (country) query.receiveCountry = country;
    if (flagged === 'true') query.isFlagged = true;
    if (search) {
      query.$or = [{ transactionId: { $regex: search, $options: 'i' } }];
    }
    
    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .populate('sender', 'firstName lastName email country')
      .populate('beneficiary', 'firstName lastName country currency')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    res.json({ success: true, transactions, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update transaction status (admin)
export const updateTransactionStatus = async (req, res) => {
  try {
    const { status, note } = req.body;
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) return res.status(404).json({ success: false, message: 'Transaction not found' });
    
    transaction.status = status;
    transaction.statusHistory.push({ status, timestamp: new Date(), note, updatedBy: req.user.email });
    if (status === 'delivered') transaction.completedAt = new Date();
    transaction.reviewedBy = req.user._id;
    transaction.reviewedAt = new Date();
    transaction.reviewNote = note;
    
    await transaction.save();
    
    await AuditLog.create({
      actor: req.user._id,
      actorRole: req.user.role,
      action: 'TRANSACTION_STATUS_UPDATED',
      resource: 'Transaction',
      resourceId: transaction._id.toString(),
      details: { newStatus: status, note },
      ipAddress: req.ip
    });
    
    res.json({ success: true, message: 'Transaction updated', transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Review KYC (admin)
export const reviewKYC = async (req, res) => {
  try {
    const { action, reason } = req.body; // action: 'approve' | 'reject'
    
    const kyc = await KYC.findById(req.params.id);
    if (!kyc) return res.status(404).json({ success: false, message: 'KYC not found' });
    
    const kycStatus = action === 'approve' ? 'approved' : 'rejected';
    
    kyc.status = kycStatus;
    kyc.reviewedAt = new Date();
    kyc.reviewedBy = req.user._id;
    if (action === 'reject') kyc.rejectedReason = reason;
    await kyc.save();
    
    await User.findByIdAndUpdate(kyc.user, { 
      kycStatus,
      ...(action === 'reject' && { kycRejectedReason: reason })
    });
    
    await AuditLog.create({
      actor: req.user._id,
      actorRole: req.user.role,
      action: `KYC_${action.toUpperCase()}D`,
      resource: 'KYC',
      resourceId: kyc._id.toString(),
      details: { reason },
      ipAddress: req.ip
    });
    
    res.json({ success: true, message: `KYC ${action}d`, kyc });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all KYC submissions
export const getAllKYC = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = status ? { status } : {};
    
    const total = await KYC.countDocuments(query);
    const kycList = await KYC.find(query)
      .populate('user', 'firstName lastName email country')
      .sort({ submittedAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    res.json({ success: true, kycList, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get audit logs
export const getAuditLogs = async (req, res) => {
  try {
    const { page = 1, limit = 50, action } = req.query;
    const query = action ? { action } : {};
    
    const total = await AuditLog.countDocuments(query);
    const logs = await AuditLog.find(query)
      .populate('actor', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    res.json({ success: true, logs, pagination: { total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
