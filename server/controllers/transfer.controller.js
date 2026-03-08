import Transaction from '../models/Transaction.model.js';
import Beneficiary from '../models/Beneficiary.model.js';
import User from '../models/User.model.js';
import AuditLog from '../models/AuditLog.model.js';

// Fraud detection rules
const checkFraudRules = async (userId, amount, currency) => {
  const flags = [];
  
  // Rule 1: High amount (>$5000 USD equivalent)
  if (amount > 5000) {
    flags.push('HIGH_AMOUNT');
  }
  
  // Rule 2: Multiple transfers in 1 hour (>3)
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentCount = await Transaction.countDocuments({
    sender: userId,
    createdAt: { $gte: oneHourAgo }
  });
  if (recentCount >= 3) {
    flags.push('MULTIPLE_TRANSFERS');
  }
  
  // Rule 3: New account sending large amount
  const user = await User.findById(userId);
  const accountAgeDays = (Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24);
  if (accountAgeDays < 7 && amount > 1000) {
    flags.push('NEW_ACCOUNT_HIGH_AMOUNT');
  }
  
  return flags;
};

const TRANSFER_FEES = {
  USD: { fixed: 2.99, percentage: 0.5 },
  GBP: { fixed: 2.49, percentage: 0.5 },
  EUR: { fixed: 2.49, percentage: 0.5 },
  default: { fixed: 3.99, percentage: 1.0 }
};

const calculateFee = (amount, currency) => {
  const feeConfig = TRANSFER_FEES[currency] || TRANSFER_FEES.default;
  return +(feeConfig.fixed + (amount * feeConfig.percentage / 100)).toFixed(2);
};

// @desc    Initiate transfer
// @route   POST /api/transfers
export const initiateTransfer = async (req, res) => {
  try {
    const {
      beneficiaryId, sendAmount, sendCurrency, receiveCurrency,
      exchangeRate, payoutMethod, paymentMethod, transferPurpose, senderNote
    } = req.body;
    
    const beneficiary = await Beneficiary.findOne({ _id: beneficiaryId, owner: req.user._id });
    if (!beneficiary) {
      return res.status(404).json({ success: false, message: 'Beneficiary not found' });
    }
    
    const transferFee = calculateFee(sendAmount, sendCurrency);
    const totalDeducted = +(sendAmount + transferFee).toFixed(2);
    const receiveAmount = +(sendAmount * exchangeRate).toFixed(2);
    
    // Check fraud rules
    const fraudFlags = await checkFraudRules(req.user._id, sendAmount, sendCurrency);
    const isFlagged = fraudFlags.length > 0;
    
    // Estimated delivery
    const estimatedDelivery = new Date();
    if (payoutMethod === 'cash_pickup') {
      estimatedDelivery.setHours(estimatedDelivery.getHours() + 2);
    } else if (payoutMethod === 'mobile_wallet') {
      estimatedDelivery.setHours(estimatedDelivery.getHours() + 1);
    } else {
      estimatedDelivery.setDate(estimatedDelivery.getDate() + 1);
    }
    
    const transaction = await Transaction.create({
      sender: req.user._id,
      beneficiary: beneficiaryId,
      sendAmount,
      sendCurrency,
      receiveAmount,
      receiveCurrency,
      exchangeRate,
      transferFee,
      totalDeducted,
      payoutMethod,
      paymentMethod,
      transferPurpose: transferPurpose || 'family_support',
      senderNote,
      sendCountry: req.user.country,
      receiveCountry: beneficiary.country,
      status: isFlagged ? 'pending' : 'processing',
      isFlagged,
      flaggedReason: isFlagged ? fraudFlags.join(', ') : undefined,
      flaggedAt: isFlagged ? new Date() : undefined,
      estimatedDelivery,
      ipAddress: req.ip,
      deviceInfo: req.get('User-Agent'),
      statusHistory: [{
        status: isFlagged ? 'pending' : 'processing',
        timestamp: new Date(),
        note: isFlagged ? 'Flagged for review' : 'Transfer initiated'
      }]
    });
    
    // Update user stats
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { totalTransfers: 1, totalAmountSent: sendAmount }
    });
    
    // Update beneficiary stats
    await Beneficiary.findByIdAndUpdate(beneficiaryId, {
      $inc: { totalTransfers: 1 },
      lastUsed: new Date()
    });
    
    await AuditLog.create({
      actor: req.user._id,
      actorRole: req.user.role,
      action: 'TRANSFER_INITIATED',
      resource: 'Transaction',
      resourceId: transaction._id.toString(),
      details: { transactionId: transaction.transactionId, amount: sendAmount, currency: sendCurrency },
      ipAddress: req.ip
    });
    
    // Simulate async processing for non-flagged transactions
    if (!isFlagged) {
      setTimeout(async () => {
        await Transaction.findByIdAndUpdate(transaction._id, {
          status: 'sent',
          $push: {
            statusHistory: { status: 'sent', timestamp: new Date(), note: 'Funds sent to provider' }
          }
        });
      }, 5000);
    }
    
    const populatedTxn = await Transaction.findById(transaction._id)
      .populate('sender', 'firstName lastName email')
      .populate('beneficiary', 'firstName lastName country currency');
    
    res.status(201).json({
      success: true,
      message: isFlagged ? 'Transfer submitted for review' : 'Transfer initiated successfully',
      transaction: populatedTxn
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user transactions
// @route   GET /api/transfers
export const getUserTransactions = async (req, res) => {
  try {
    const { page = 1, limit = 10, status, search } = req.query;
    
    const query = { sender: req.user._id };
    if (status) query.status = status;
    if (search) {
      query.$or = [
        { transactionId: { $regex: search, $options: 'i' } }
      ];
    }
    
    const total = await Transaction.countDocuments(query);
    const transactions = await Transaction.find(query)
      .populate('beneficiary', 'firstName lastName country currency payoutMethod')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    
    res.json({
      success: true,
      transactions,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single transaction
// @route   GET /api/transfers/:id
export const getTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      $or: [{ _id: req.params.id }, { transactionId: req.params.id }],
      sender: req.user._id
    }).populate('beneficiary', 'firstName lastName country currency payoutMethod bankDetails walletDetails');
    
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found' });
    }
    
    res.json({ success: true, transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel transaction
// @route   PUT /api/transfers/:id/cancel
export const cancelTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findOne({
      _id: req.params.id,
      sender: req.user._id,
      status: 'pending'
    });
    
    if (!transaction) {
      return res.status(404).json({ success: false, message: 'Transaction not found or cannot be cancelled' });
    }
    
    transaction.status = 'cancelled';
    transaction.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: 'Cancelled by user'
    });
    await transaction.save();
    
    res.json({ success: true, message: 'Transaction cancelled', transaction });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get transfer quote
// @route   GET /api/transfers/quote
export const getTransferQuote = async (req, res) => {
  try {
    const { amount, fromCurrency, toCurrency, payoutMethod } = req.query;
    
    if (!amount || !fromCurrency || !toCurrency) {
      return res.status(400).json({ success: false, message: 'Amount, fromCurrency, toCurrency required' });
    }
    
    // Mock exchange rates (in production, fetch from FX API)
    const mockRates = {
      'USD-PKR': 278.5, 'USD-INR': 83.2, 'USD-BDT': 110.5,
      'USD-NPR': 133.0, 'USD-PHP': 56.8, 'USD-EUR': 0.92,
      'USD-GBP': 0.79, 'USD-AED': 3.67, 'USD-SAR': 3.75,
      'USD-MYR': 4.72, 'USD-IDR': 15650, 'USD-VND': 24500,
      'GBP-PKR': 353.5, 'EUR-PKR': 302.0,
    };
    
    const rateKey = `${fromCurrency}-${toCurrency}`;
    const exchangeRate = mockRates[rateKey] || 1;
    const fee = calculateFee(parseFloat(amount), fromCurrency);
    const receiveAmount = +(parseFloat(amount) * exchangeRate).toFixed(2);
    
    res.json({
      success: true,
      quote: {
        sendAmount: parseFloat(amount),
        sendCurrency: fromCurrency,
        receiveAmount,
        receiveCurrency: toCurrency,
        exchangeRate,
        transferFee: fee,
        totalDeducted: +(parseFloat(amount) + fee).toFixed(2),
        estimatedDelivery: payoutMethod === 'cash_pickup' ? '1-2 hours' : payoutMethod === 'mobile_wallet' ? '30 mins' : '1-2 business days',
        validUntil: new Date(Date.now() + 30 * 60 * 1000) // 30 min
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
