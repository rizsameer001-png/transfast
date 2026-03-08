import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  phone: { type: String, required: true },
  password: { type: String, required: true, minlength: 8 },
  country: { type: String, required: true },
  currency: { type: String, default: 'USD' },
  role: { type: String, enum: ['user', 'admin', 'compliance', 'support'], default: 'user' },
  
  // Account status
  isEmailVerified: { type: Boolean, default: false },
  isPhoneVerified: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  isSuspended: { type: Boolean, default: false },
  suspendedReason: { type: String },
  
  // KYC
  kycStatus: { type: String, enum: ['pending', 'submitted', 'approved', 'rejected'], default: 'pending' },
  kycRejectedReason: { type: String },
  
  // Verification tokens
  emailVerificationToken: { type: String },
  emailVerificationExpires: { type: Date },
  passwordResetToken: { type: String },
  passwordResetExpires: { type: Date },
  otpCode: { type: String },
  otpExpires: { type: Date },
  
  // 2FA
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: { type: String },
  
  // Profile
  avatar: { type: String },
  dateOfBirth: { type: Date },
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
  },
  
  // Stats
  totalTransfers: { type: Number, default: 0 },
  totalAmountSent: { type: Number, default: 0 },
  lastLogin: { type: Date },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
}, { timestamps: true });

// Hash password before saving
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Virtual: full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

userSchema.set('toJSON', { virtuals: true });

export default mongoose.model('User', userSchema);
