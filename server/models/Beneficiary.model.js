import mongoose from 'mongoose';

const beneficiarySchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  
  // Personal details
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, trim: true, lowercase: true },
  phone: { type: String },
  country: { type: String, required: true },
  currency: { type: String, required: true },
  relationship: { 
    type: String, 
    enum: ['family', 'friend', 'business', 'self', 'other'], 
    default: 'family'
  },
  
  // Payout method
  payoutMethod: { 
    type: String, 
    enum: ['bank_deposit', 'cash_pickup', 'mobile_wallet'],
    required: true
  },
  
  // Bank details (for bank_deposit)
  bankDetails: {
    bankName: String,
    accountNumber: String,
    accountType: { type: String, enum: ['savings', 'checking', 'current'] },
    routingNumber: String,
    swiftCode: String,
    iban: String,
    branchCode: String,
  },
  
  // Mobile wallet (for mobile_wallet)
  walletDetails: {
    walletProvider: String,
    walletNumber: String,
  },
  
  // Cash pickup (for cash_pickup)
  cashPickupDetails: {
    pickupProvider: String,
    city: String,
  },
  
  isActive: { type: Boolean, default: true },
  lastUsed: { type: Date },
  totalTransfers: { type: Number, default: 0 },
  nickname: { type: String },
}, { timestamps: true });

beneficiarySchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

beneficiarySchema.set('toJSON', { virtuals: true });

export default mongoose.model('Beneficiary', beneficiarySchema);
