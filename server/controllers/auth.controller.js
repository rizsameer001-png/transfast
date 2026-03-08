import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import User from '../models/User.model.js';
import AuditLog from '../models/AuditLog.model.js';

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
};

// @desc    Register user
// @route   POST /api/auth/register
export const register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password, country } = req.body;
    
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'Email already registered' });
    }
    
    // Generate email verification token
    const emailVerificationToken = crypto.randomBytes(32).toString('hex');
    
    const user = await User.create({
      firstName, lastName, email, phone, password, country,
      emailVerificationToken,
      emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000
    });
    
    // In production: send verification email here
    // await sendVerificationEmail(user.email, emailVerificationToken);
    
    const token = generateToken(user._id);
    
    await AuditLog.create({
      actor: user._id,
      actorRole: user.role,
      action: 'USER_REGISTERED',
      resource: 'User',
      resourceId: user._id.toString(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.status(201).json({
      success: true,
      message: 'Registration successful. Please verify your email.',
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        country: user.country,
        role: user.role,
        kycStatus: user.kycStatus,
        isEmailVerified: user.isEmailVerified,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Login user
// @route   POST /api/auth/login
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await User.findOne({ email });
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    
    if (user.isSuspended) {
      return res.status(403).json({ success: false, message: 'Account suspended. Contact support.' });
    }
    
    user.lastLogin = new Date();
    user.loginAttempts = 0;
    await user.save({ validateBeforeSave: false });
    
    const token = generateToken(user._id);
    
    await AuditLog.create({
      actor: user._id,
      actorRole: user.role,
      action: 'USER_LOGIN',
      resource: 'User',
      resourceId: user._id.toString(),
      ipAddress: req.ip,
      userAgent: req.get('User-Agent')
    });
    
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        country: user.country,
        role: user.role,
        kycStatus: user.kycStatus,
        isEmailVerified: user.isEmailVerified,
        totalTransfers: user.totalTransfers,
        lastLogin: user.lastLogin,
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get current user
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -emailVerificationToken -passwordResetToken');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Forgot password
// @route   POST /api/auth/forgot-password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'No user found with that email' });
    }
    
    const resetToken = crypto.randomBytes(32).toString('hex');
    user.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 mins
    await user.save({ validateBeforeSave: false });
    
    // In production: send reset email
    // const resetURL = `${process.env.CLIENT_URL}/reset-password/${resetToken}`;
    
    res.json({ success: true, message: 'Password reset email sent', resetToken }); // remove resetToken in prod
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Reset password
// @route   POST /api/auth/reset-password/:token
export const resetPassword = async (req, res) => {
  try {
    const hashedToken = crypto.createHash('sha256').update(req.params.token).digest('hex');
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ success: false, message: 'Token is invalid or expired' });
    }
    
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    
    const token = generateToken(user._id);
    res.json({ success: true, message: 'Password reset successful', token });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    
    if (!(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ success: false, message: 'Current password incorrect' });
    }
    
    user.password = newPassword;
    await user.save();
    
    res.json({ success: true, message: 'Password changed successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify email
// @route   GET /api/auth/verify-email/:token
export const verifyEmail = async (req, res) => {
  try {
    const user = await User.findOne({
      emailVerificationToken: req.params.token,
      emailVerificationExpires: { $gt: Date.now() }
    });
    
    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
    }
    
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    
    res.json({ success: true, message: 'Email verified successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
