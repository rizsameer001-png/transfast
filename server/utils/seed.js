import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.model.js';
import Transaction from '../models/Transaction.model.js';
import Beneficiary from '../models/Beneficiary.model.js';

dotenv.config();

const seed = async () => {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/transfast');
  console.log('Connected to MongoDB');
  
  // Clear existing
  await User.deleteMany({});
  await Transaction.deleteMany({});
  await Beneficiary.deleteMany({});
  
  // Create admin
  const admin = await User.create({
    firstName: 'Super',
    lastName: 'Admin',
    email: process.env.ADMIN_EMAIL || 'admin@transfast.com',
    phone: '+1234567890',
    password: process.env.ADMIN_PASSWORD || 'Admin@123456',
    country: 'US',
    role: 'admin',
    isEmailVerified: true,
    kycStatus: 'approved',
  });
  
  // Create compliance officer
  await User.create({
    firstName: 'Compliance',
    lastName: 'Officer',
    email: 'compliance@transfast.com',
    phone: '+1234567891',
    password: 'Compliance@123',
    country: 'US',
    role: 'compliance',
    isEmailVerified: true,
    kycStatus: 'approved',
  });
  
  // Create sample users
  const user1 = await User.create({
    firstName: 'John',
    lastName: 'Smith',
    email: 'john@example.com',
    phone: '+12345678901',
    password: 'User@12345',
    country: 'US',
    role: 'user',
    isEmailVerified: true,
    kycStatus: 'approved',
    totalTransfers: 5,
    totalAmountSent: 2500,
  });
  
  const user2 = await User.create({
    firstName: 'Sarah',
    lastName: 'Connor',
    email: 'sarah@example.com',
    phone: '+12345678902',
    password: 'User@12345',
    country: 'GB',
    role: 'user',
    isEmailVerified: true,
    kycStatus: 'submitted',
  });
  
  // Create beneficiary
  const beneficiary = await Beneficiary.create({
    owner: user1._id,
    firstName: 'Ahmed',
    lastName: 'Khan',
    country: 'PK',
    currency: 'PKR',
    phone: '+923001234567',
    relationship: 'family',
    payoutMethod: 'bank_deposit',
    bankDetails: {
      bankName: 'HBL Bank',
      accountNumber: '0123456789012',
      accountType: 'savings',
    }
  });
  
  // Create sample transactions
  await Transaction.create({
    sender: user1._id,
    beneficiary: beneficiary._id,
    sendAmount: 500,
    sendCurrency: 'USD',
    receiveAmount: 139250,
    receiveCurrency: 'PKR',
    exchangeRate: 278.5,
    transferFee: 5.49,
    totalDeducted: 505.49,
    payoutMethod: 'bank_deposit',
    paymentMethod: 'debit_card',
    sendCountry: 'US',
    receiveCountry: 'PK',
    status: 'delivered',
    completedAt: new Date(),
    statusHistory: [
      { status: 'pending', timestamp: new Date(Date.now() - 86400000) },
      { status: 'processing', timestamp: new Date(Date.now() - 80000000) },
      { status: 'sent', timestamp: new Date(Date.now() - 70000000) },
      { status: 'delivered', timestamp: new Date() }
    ]
  });
  
  await Transaction.create({
    sender: user1._id,
    beneficiary: beneficiary._id,
    sendAmount: 1000,
    sendCurrency: 'USD',
    receiveAmount: 278500,
    receiveCurrency: 'PKR',
    exchangeRate: 278.5,
    transferFee: 7.99,
    totalDeducted: 1007.99,
    payoutMethod: 'bank_deposit',
    paymentMethod: 'bank_transfer',
    sendCountry: 'US',
    receiveCountry: 'PK',
    status: 'processing',
    isFlagged: false,
    statusHistory: [
      { status: 'pending', timestamp: new Date(Date.now() - 3600000) },
      { status: 'processing', timestamp: new Date() }
    ]
  });
  
  console.log('✅ Seed completed!');
  console.log('Admin:', admin.email, '| Password: Admin@123456');
  console.log('User:', user1.email, '| Password: User@12345');
  
  process.exit(0);
};

seed().catch(console.error);
