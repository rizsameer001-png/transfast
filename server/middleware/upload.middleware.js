// server/middleware/upload.middleware.js
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directories exist
const dirs = ['uploads/kyc/id_front', 'uploads/kyc/id_back', 'uploads/kyc/selfie', 'uploads/kyc/proof_of_address'];
dirs.forEach(d => { if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true }); });

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const folderMap = {
      idFrontImage:    'uploads/kyc/id_front',
      idBackImage:     'uploads/kyc/id_back',
      selfieImage:     'uploads/kyc/selfie',
      proofOfAddress:  'uploads/kyc/proof_of_address',
    };
    cb(null, folderMap[file.fieldname] || 'uploads/kyc');
  },
  filename: (req, file, cb) => {
    const userId = req.user?._id || 'unknown';
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${userId}_${file.fieldname}_${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowed = /jpeg|jpg|png|pdf/;
  const ext = path.extname(file.originalname).toLowerCase();
  const mime = file.mimetype;
  if (allowed.test(ext) && (mime.startsWith('image/') || mime === 'application/pdf')) {
    cb(null, true);
  } else {
    cb(new Error('Only JPG, PNG, and PDF files are allowed'), false);
  }
};

export const kycUpload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB per file
}).fields([
  { name: 'idFrontImage',   maxCount: 1 },
  { name: 'idBackImage',    maxCount: 1 },
  { name: 'selfieImage',    maxCount: 1 },
  { name: 'proofOfAddress', maxCount: 1 },
]);
