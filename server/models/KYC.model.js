import mongoose from 'mongoose';

const kycSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  
  // Personal info
  dateOfBirth: { type: Date, required: true },
  nationality: { type: String, required: true },
  occupation: { type: String },
  sourceOfFunds: { 
    type: String, 
    enum: ['employment', 'business', 'savings', 'investment', 'inheritance', 'other'],
    required: true
  },
  
  // Address
  address: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: String,
    postalCode: String,
    country: { type: String, required: true },
  },
  
  // Documents
  idType: { 
    type: String, 
    enum: ['passport', 'national_id', 'drivers_license', 'residence_permit'],
    required: true
  },
  idNumber: { type: String, required: true },
  idExpiryDate: { type: Date },
  idFrontImage: { type: String },   // file path or base64
  idBackImage: { type: String },
  selfieImage: { type: String },
  proofOfAddress: { type: String },
  
  // Status
  status: { 
    type: String, 
    enum: ['pending', 'under_review', 'approved', 'rejected'],
    default: 'pending'
  },
  submittedAt: { type: Date },
  reviewedAt: { type: Date },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  rejectedReason: { type: String },
  notes: { type: String },
  
  // Risk assessment
  riskLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
}, { timestamps: true });

export default mongoose.model('KYC', kycSchema);
