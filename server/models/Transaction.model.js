import mongoose from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const transactionSchema = new mongoose.Schema({
  transactionId: { 
    type: String, 
    unique: true, 
    default: () => 'TXN-' + uuidv4().toUpperCase().substring(0, 12)
  },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  beneficiary: { type: mongoose.Schema.Types.ObjectId, ref: 'Beneficiary', required: true },
  
  // Amount details
  sendAmount: { type: Number, required: true },
  sendCurrency: { type: String, required: true, default: 'USD' },
  receiveAmount: { type: Number, required: true },
  receiveCurrency: { type: String, required: true },
  exchangeRate: { type: Number, required: true },
  transferFee: { type: Number, required: true, default: 0 },
  totalDeducted: { type: Number, required: true },
  
  // Payout method
  payoutMethod: { 
    type: String, 
    enum: ['bank_deposit', 'cash_pickup', 'mobile_wallet', 'card'],
    required: true 
  },
  
  // Payment method (how sender pays)
  paymentMethod: {
    type: String,
    enum: ['bank_transfer', 'debit_card', 'credit_card'],
    required: true
  },
  
  // Status tracking
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'sent', 'delivered', 'failed', 'cancelled', 'refunded'],
    default: 'pending'
  },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now },
    note: String,
    updatedBy: String
  }],
  
  // Countries
  sendCountry: { type: String, required: true },
  receiveCountry: { type: String, required: true },
  
  // Purpose
  transferPurpose: { type: String, enum: ['family_support', 'education', 'medical', 'business', 'gift', 'other'], default: 'family_support' },
  
  // Compliance & fraud
  isFlagged: { type: Boolean, default: false },
  flaggedReason: { type: String },
  flaggedAt: { type: Date },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  reviewedAt: { type: Date },
  reviewNote: { type: String },
  
  // Reference numbers
  bankReference: { type: String },
  providerReference: { type: String },
  
  // Timestamps
  initiatedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  estimatedDelivery: { type: Date },
  
  // IP and device info for fraud detection
  ipAddress: { type: String },
  deviceInfo: { type: String },
  
  // Notes
  senderNote: { type: String, maxlength: 200 },
}, { timestamps: true });

// Index for performance
transactionSchema.index({ sender: 1, createdAt: -1 });
transactionSchema.index({ transactionId: 1 });
transactionSchema.index({ status: 1 });
transactionSchema.index({ isFlagged: 1 });

export default mongoose.model('Transaction', transactionSchema);
