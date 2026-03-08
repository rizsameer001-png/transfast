import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { kycAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { Shield, Check, Clock, AlertCircle, Upload, X, FileText, Image } from 'lucide-react';

// ── File Upload Box ────────────────────────────────────────────────────────
function FileUploadBox({ label, fieldName, file, preview, onFileChange, onRemove, required }) {
  const inputRef = useRef(null);
  const isImage = file && file.type?.startsWith('image/');
  const isPDF   = file && file.type === 'application/pdf';

  return (
    <div className="space-y-1.5">
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">
        {label}{required && <span className="text-red-500 ml-0.5">*</span>}
      </label>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,application/pdf"
        className="hidden"
        onChange={e => onFileChange(fieldName, e.target.files[0])}
      />
      {!file ? (
        <button
          type="button"
          onClick={() => inputRef.current.click()}
          className="w-full h-28 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-primary-400 hover:bg-primary-50 transition-all group"
        >
          <Upload size={22} className="text-gray-300 group-hover:text-primary-500 transition-colors" />
          <span className="text-xs text-gray-400 group-hover:text-primary-500">Click to upload</span>
          <span className="text-xs text-gray-300">JPG, PNG or PDF · max 5MB</span>
        </button>
      ) : (
        <div className="relative border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
          {/* Image preview */}
          {isImage && preview && (
            <img
              src={preview}
              alt={label}
              className="w-full h-28 object-cover"
            />
          )}
          {/* PDF placeholder */}
          {isPDF && (
            <div className="w-full h-28 flex flex-col items-center justify-center gap-2 bg-red-50">
              <FileText size={28} className="text-red-400" />
              <span className="text-xs text-gray-600 font-medium truncate px-4 max-w-full">{file.name}</span>
            </div>
          )}
          {/* Unknown image type fallback */}
          {!isImage && !isPDF && (
            <div className="w-full h-28 flex flex-col items-center justify-center gap-2">
              <Image size={28} className="text-gray-400" />
              <span className="text-xs text-gray-600 truncate px-4 max-w-full">{file.name}</span>
            </div>
          )}
          {/* Remove button */}
          <button
            type="button"
            onClick={() => onRemove(fieldName)}
            className="absolute top-2 right-2 w-6 h-6 bg-black/60 rounded-full flex items-center justify-center hover:bg-red-600 transition-colors"
          >
            <X size={12} className="text-white" />
          </button>
          {/* File name bar */}
          <div className="px-3 py-1.5 bg-white border-t border-gray-100 flex items-center gap-1.5">
            <Check size={11} className="text-green-500 flex-shrink-0" />
            <span className="text-xs text-gray-600 truncate">{file.name}</span>
            <span className="text-xs text-gray-400 ml-auto flex-shrink-0">
              {(file.size / 1024).toFixed(0)} KB
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Main KYC Page ──────────────────────────────────────────────────────────
export default function KYCPage() {
  const { user } = useAuth();
  const [kyc, setKyc]         = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    dateOfBirth: '', nationality: '', occupation: '',
    sourceOfFunds: 'employment', idType: 'passport',
    idNumber: '', idExpiryDate: '',
    address: { street: '', city: '', state: '', postalCode: '', country: '' },
  });

  // Files & previews
  const [files, setFiles]     = useState({ idFrontImage: null, idBackImage: null, selfieImage: null, proofOfAddress: null });
  const [previews, setPreviews] = useState({ idFrontImage: null, idBackImage: null, selfieImage: null, proofOfAddress: null });

  useEffect(() => {
    kycAPI.getStatus()
      .then(r => setKyc(r.data.kyc))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Create object URLs for image previews
  useEffect(() => {
    const newPreviews = {};
    Object.entries(files).forEach(([key, file]) => {
      if (file && file.type?.startsWith('image/')) {
        newPreviews[key] = URL.createObjectURL(file);
      } else {
        newPreviews[key] = null;
      }
    });
    setPreviews(newPreviews);
    // Cleanup old object URLs
    return () => Object.values(newPreviews).forEach(url => url && URL.revokeObjectURL(url));
  }, [files]);

  const handleFileChange = (field, file) => {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) { toast.error(`${field}: File must be under 5MB`); return; }
    setFiles(f => ({ ...f, [field]: file }));
  };

  const handleRemove = (field) => setFiles(f => ({ ...f, [field]: null }));

  const u  = (f, v) => setForm(p => ({ ...p, [f]: v }));
  const ua = (f, v) => setForm(p => ({ ...p, address: { ...p.address, [f]: v } }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate required documents
    if (!files.idFrontImage) { toast.error('ID Front image is required'); return; }
    if (!files.selfieImage)  { toast.error('Selfie image is required'); return; }

    setSubmitting(true);
    try {
      // Build FormData — required for file uploads
      const fd = new FormData();

      // Append text fields
      fd.append('dateOfBirth',   form.dateOfBirth);
      fd.append('nationality',   form.nationality);
      fd.append('occupation',    form.occupation);
      fd.append('sourceOfFunds', form.sourceOfFunds);
      fd.append('idType',        form.idType);
      fd.append('idNumber',      form.idNumber);
      if (form.idExpiryDate) fd.append('idExpiryDate', form.idExpiryDate);
      // Address as JSON string (parsed server-side)
      fd.append('address', JSON.stringify(form.address));

      // Append files
      if (files.idFrontImage)   fd.append('idFrontImage',   files.idFrontImage);
      if (files.idBackImage)    fd.append('idBackImage',    files.idBackImage);
      if (files.selfieImage)    fd.append('selfieImage',    files.selfieImage);
      if (files.proofOfAddress) fd.append('proofOfAddress', files.proofOfAddress);

      await kycAPI.submit(fd);
      toast.success('KYC submitted for review! We\'ll get back to you in 1-2 business days.');
      const r = await kycAPI.getStatus();
      setKyc(r.data.kyc);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    }
    setSubmitting(false);
  };

  // ── Status Banner ────────────────────────────────────────────────────────
  const StatusBanner = () => {
    const cfg = {
      approved:     { bg: 'bg-green-50 border-green-200', icon: Check,        color: 'text-green-600',  title: 'KYC Approved',          msg: 'Your identity is verified. You can now send money!' },
      under_review: { bg: 'bg-blue-50 border-blue-200',   icon: Clock,        color: 'text-blue-600',   title: 'Under Review',          msg: 'Your documents are being reviewed. This takes 1-2 business days.' },
      submitted:    { bg: 'bg-blue-50 border-blue-200',   icon: Clock,        color: 'text-blue-600',   title: 'Submitted',             msg: 'Your KYC is submitted and awaiting review.' },
      rejected:     { bg: 'bg-red-50 border-red-200',     icon: AlertCircle,  color: 'text-red-600',    title: 'KYC Rejected',          msg: kyc?.rejectedReason || 'Verification failed. Please resubmit.' },
      pending:      { bg: 'bg-yellow-50 border-yellow-200', icon: Shield,     color: 'text-yellow-600', title: 'Verification Required', msg: 'Submit your KYC documents to start sending money internationally.' },
    };
    const status = kyc?.status || user?.kycStatus || 'pending';
    const c = cfg[status] || cfg.pending;
    const Icon = c.icon;
    return (
      <div className={`border rounded-2xl p-5 flex items-start gap-4 ${c.bg}`}>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-white flex-shrink-0 ${c.color}`}>
          <Icon size={20} />
        </div>
        <div>
          <p className={`font-bold text-sm ${c.color}`}>{c.title}</p>
          <p className="text-sm text-gray-600 mt-0.5">{c.msg}</p>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" />
    </div>
  );

  const currentStatus = kyc?.status || user?.kycStatus || 'pending';
  const canSubmit = ['pending', 'rejected'].includes(currentStatus);

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">KYC Verification</h1>
        <p className="text-sm text-gray-500 mt-1">Verify your identity to send money internationally</p>
      </div>

      <StatusBanner />

      {/* Show existing uploaded docs (read-only when submitted/approved) */}
      {kyc && ['under_review', 'submitted', 'approved'].includes(kyc.status) && (
        <div className="card space-y-4">
          <h2 className="font-bold text-gray-900">Submitted Documents</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: 'ID Front',        key: 'idFrontImage' },
              { label: 'ID Back',         key: 'idBackImage' },
              { label: 'Selfie',          key: 'selfieImage' },
              { label: 'Proof of Address',key: 'proofOfAddress' },
            ].map(({ label, key }) => (
              <div key={key} className="border border-gray-100 rounded-xl overflow-hidden">
                {kyc[key] ? (
                  kyc[key].match(/\.(jpg|jpeg|png)$/i) ? (
                    <img
                      src={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/${kyc[key]}`}
                      alt={label}
                      className="w-full h-28 object-cover"
                    />
                  ) : (
                    <a
                      href={`${import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'}/${kyc[key]}`}
                      target="_blank" rel="noreferrer"
                      className="w-full h-28 flex flex-col items-center justify-center gap-2 bg-red-50 hover:bg-red-100 transition-colors"
                    >
                      <FileText size={26} className="text-red-400" />
                      <span className="text-xs text-gray-500">View PDF</span>
                    </a>
                  )
                ) : (
                  <div className="w-full h-28 flex items-center justify-center bg-gray-50">
                    <span className="text-xs text-gray-300">Not uploaded</span>
                  </div>
                )}
                <div className="px-3 py-1.5 bg-white border-t border-gray-100">
                  <span className="text-xs font-medium text-gray-500">{label}</span>
                  {kyc[key] && <Check size={11} className="inline ml-1.5 text-green-500" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {canSubmit && (
        <form onSubmit={handleSubmit} className="card space-y-6">
          {/* ── Personal Info ── */}
          <div>
            <h2 className="font-bold text-gray-900 text-lg mb-4">Personal Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Date of Birth <span className="text-red-500">*</span></label>
                  <input type="date" required className="input-field" value={form.dateOfBirth} onChange={e => u('dateOfBirth', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nationality <span className="text-red-500">*</span></label>
                  <input required className="input-field" placeholder="e.g. American" value={form.nationality} onChange={e => u('nationality', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Occupation</label>
                  <input className="input-field" placeholder="Your occupation" value={form.occupation} onChange={e => u('occupation', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Source of Funds <span className="text-red-500">*</span></label>
                  <select required className="input-field" value={form.sourceOfFunds} onChange={e => u('sourceOfFunds', e.target.value)}>
                    <option value="employment">Employment</option>
                    <option value="business">Business</option>
                    <option value="savings">Savings</option>
                    <option value="investment">Investment</option>
                    <option value="inheritance">Inheritance</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* ── Identity Document ── */}
          <div>
            <h2 className="font-bold text-gray-900 text-lg mb-4">Identity Document</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">ID Type <span className="text-red-500">*</span></label>
                  <select required className="input-field" value={form.idType} onChange={e => u('idType', e.target.value)}>
                    <option value="passport">Passport</option>
                    <option value="national_id">National ID</option>
                    <option value="drivers_license">Driver's License</option>
                    <option value="residence_permit">Residence Permit</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">ID Number <span className="text-red-500">*</span></label>
                  <input required className="input-field" placeholder="Document number" value={form.idNumber} onChange={e => u('idNumber', e.target.value)} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">ID Expiry Date</label>
                <input type="date" className="input-field w-1/2" value={form.idExpiryDate} onChange={e => u('idExpiryDate', e.target.value)} />
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* ── Document Uploads ── */}
          <div>
            <h2 className="font-bold text-gray-900 text-lg mb-1">Document Uploads</h2>
            <p className="text-sm text-gray-400 mb-4">JPG, PNG or PDF · Max 5MB per file. ID Front and Selfie are required.</p>
            <div className="grid grid-cols-2 gap-4">
              <FileUploadBox label="ID Front" fieldName="idFrontImage" required
                file={files.idFrontImage} preview={previews.idFrontImage}
                onFileChange={handleFileChange} onRemove={handleRemove} />
              <FileUploadBox label="ID Back" fieldName="idBackImage"
                file={files.idBackImage} preview={previews.idBackImage}
                onFileChange={handleFileChange} onRemove={handleRemove} />
              <FileUploadBox label="Selfie" fieldName="selfieImage" required
                file={files.selfieImage} preview={previews.selfieImage}
                onFileChange={handleFileChange} onRemove={handleRemove} />
              <FileUploadBox label="Proof of Address" fieldName="proofOfAddress"
                file={files.proofOfAddress} preview={previews.proofOfAddress}
                onFileChange={handleFileChange} onRemove={handleRemove} />
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* ── Address ── */}
          <div>
            <h2 className="font-bold text-gray-900 text-lg mb-4">Residential Address</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Street Address <span className="text-red-500">*</span></label>
                <input required className="input-field" placeholder="123 Main Street" value={form.address.street} onChange={e => ua('street', e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">City <span className="text-red-500">*</span></label>
                  <input required className="input-field" placeholder="New York" value={form.address.city} onChange={e => ua('city', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">State / Province</label>
                  <input className="input-field" placeholder="NY" value={form.address.state} onChange={e => ua('state', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Postal Code</label>
                  <input className="input-field" placeholder="10001" value={form.address.postalCode} onChange={e => ua('postalCode', e.target.value)} />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Country <span className="text-red-500">*</span></label>
                  <input required className="input-field" placeholder="United States" value={form.address.country} onChange={e => ua('country', e.target.value)} />
                </div>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full py-3.5 flex items-center justify-center gap-2 text-base"
          >
            {submitting
              ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</>
              : <><Shield size={17} /> Submit KYC Documents</>}
          </button>
        </form>
      )}
    </div>
  );
}
