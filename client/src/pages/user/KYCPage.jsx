import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { kycAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { Shield, Check, Clock, AlertCircle, Upload } from 'lucide-react';

export default function KYCPage() {
  const { user } = useAuth();
  const [kyc, setKyc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ dateOfBirth: '', nationality: '', occupation: '', sourceOfFunds: 'employment', idType: 'passport', idNumber: '', idExpiryDate: '', address: { street: '', city: '', state: '', postalCode: '', country: '' } });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    kycAPI.getStatus().then(r => { setKyc(r.data.kyc); }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await kycAPI.submit(form);
      toast.success('KYC submitted for review!');
      const r = await kycAPI.getStatus();
      setKyc(r.data.kyc);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Submission failed');
    }
    setSubmitting(false);
  };

  const u = (f, v) => setForm(p => ({...p, [f]: v}));
  const ua = (f, v) => setForm(p => ({...p, address: {...p.address, [f]: v}}));

  const StatusCard = () => {
    const configs = {
      approved: { bg: 'bg-green-50 border-green-200', icon: Check, color: 'text-green-600', title: 'KYC Approved', msg: 'Your identity has been verified. You can now send money!' },
      under_review: { bg: 'bg-blue-50 border-blue-200', icon: Clock, color: 'text-blue-600', title: 'Under Review', msg: 'Your KYC documents are being reviewed. This takes 1-2 business days.' },
      rejected: { bg: 'bg-red-50 border-red-200', icon: AlertCircle, color: 'text-red-600', title: 'KYC Rejected', msg: kyc?.rejectedReason || 'Verification failed. Please resubmit.' },
      pending: { bg: 'bg-yellow-50 border-yellow-200', icon: Shield, color: 'text-yellow-600', title: 'Pending Verification', msg: 'Submit your KYC documents to start sending money.' },
    };
    const cfg = configs[kyc?.status || user?.kycStatus] || configs.pending;
    const Icon = cfg.icon;
    return (
      <div className={`border rounded-2xl p-5 flex items-center gap-4 ${cfg.bg}`}>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center bg-white ${cfg.color}`}><Icon size={22} /></div>
        <div><p className={`font-bold ${cfg.color}`}>{cfg.title}</p><p className="text-sm text-gray-600 mt-0.5">{cfg.msg}</p></div>
      </div>
    );
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" /></div>;

  const canSubmit = !kyc || kyc.status === 'rejected' || user?.kycStatus === 'pending';

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold text-gray-900">KYC Verification</h1><p className="text-sm text-gray-500 mt-1">Verify your identity to send money internationally</p></div>

      <StatusCard />

      {canSubmit && (
        <form onSubmit={handleSubmit} className="card space-y-5">
          <h2 className="font-bold text-gray-900 text-lg">Personal Information</h2>

          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Date of Birth *</label><input type="date" required className="input-field" value={form.dateOfBirth} onChange={e => u('dateOfBirth', e.target.value)} /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Nationality *</label><input required className="input-field" placeholder="e.g. American" value={form.nationality} onChange={e => u('nationality', e.target.value)} /></div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Occupation</label><input className="input-field" placeholder="Your occupation" value={form.occupation} onChange={e => u('occupation', e.target.value)} /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Source of Funds *</label>
              <select required className="input-field" value={form.sourceOfFunds} onChange={e => u('sourceOfFunds', e.target.value)}>
                <option value="employment">Employment</option><option value="business">Business</option>
                <option value="savings">Savings</option><option value="investment">Investment</option>
                <option value="inheritance">Inheritance</option><option value="other">Other</option>
              </select>
            </div>
          </div>

          <hr className="border-gray-100" />
          <h2 className="font-bold text-gray-900 text-lg">Identity Document</h2>

          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">ID Type *</label>
              <select required className="input-field" value={form.idType} onChange={e => u('idType', e.target.value)}>
                <option value="passport">Passport</option><option value="national_id">National ID</option>
                <option value="drivers_license">Driver's License</option><option value="residence_permit">Residence Permit</option>
              </select>
            </div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">ID Number *</label><input required className="input-field" placeholder="Document number" value={form.idNumber} onChange={e => u('idNumber', e.target.value)} /></div>
          </div>

          <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">ID Expiry Date</label><input type="date" className="input-field" value={form.idExpiryDate} onChange={e => u('idExpiryDate', e.target.value)} /></div>

{/*          <div className="grid grid-cols-2 gap-3">
            {['ID Front', 'ID Back', 'Selfie', 'Proof of Address'].map(d => (
              <div key={d} className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-primary-300 transition-colors cursor-pointer">
                <Upload className="w-6 h-6 text-gray-300 mx-auto mb-2" />
                <p className="text-xs font-medium text-gray-500">{d}</p>
                <p className="text-xs text-gray-400 mt-0.5">JPG, PNG, PDF</p>
              </div>
            ))}
          </div>*/}
          <div className="grid grid-cols-2 gap-3">

  {/* ID FRONT */}
  <label className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-primary-300 cursor-pointer">
    <Upload className="w-6 h-6 text-gray-300 mx-auto mb-2" />
    <p className="text-xs font-medium text-gray-500">ID Front</p>
    <input
      type="file"
      className="hidden"
      accept="image/*,.pdf"
      onChange={(e) => handleFileUpload('idFront', e.target.files[0])}
    />
  </label>

  {/* ID BACK */}
  <label className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-primary-300 cursor-pointer">
    <Upload className="w-6 h-6 text-gray-300 mx-auto mb-2" />
    <p className="text-xs font-medium text-gray-500">ID Back</p>
    <input
      type="file"
      className="hidden"
      accept="image/*,.pdf"
      onChange={(e) => handleFileUpload('idBack', e.target.files[0])}
    />
  </label>

  {/* SELFIE */}
  <label className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-primary-300 cursor-pointer">
    <Upload className="w-6 h-6 text-gray-300 mx-auto mb-2" />
    <p className="text-xs font-medium text-gray-500">Selfie</p>
    <input
      type="file"
      className="hidden"
      accept="image/*"
      onChange={(e) => handleFileUpload('selfie', e.target.files[0])}
    />
  </label>

  {/* ADDRESS PROOF */}
  <label className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-primary-300 cursor-pointer">
    <Upload className="w-6 h-6 text-gray-300 mx-auto mb-2" />
    <p className="text-xs font-medium text-gray-500">Proof of Address</p>
    <input
      type="file"
      className="hidden"
      accept="image/*,.pdf"
      onChange={(e) => handleFileUpload('addressProof', e.target.files[0])}
    />
  </label>

</div>
          <hr className="border-gray-100" />
          <h2 className="font-bold text-gray-900 text-lg">Address</h2>

          <input required className="input-field" placeholder="Street Address *" value={form.address.street} onChange={e => ua('street', e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <input required className="input-field" placeholder="City *" value={form.address.city} onChange={e => ua('city', e.target.value)} />
            <input className="input-field" placeholder="State / Province" value={form.address.state} onChange={e => ua('state', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <input className="input-field" placeholder="Postal Code" value={form.address.postalCode} onChange={e => ua('postalCode', e.target.value)} />
            <input required className="input-field" placeholder="Country *" value={form.address.country} onChange={e => ua('country', e.target.value)} />
          </div>

          <button type="submit" disabled={submitting} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
            {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Submitting...</> : <><Shield size={16} /> Submit KYC</>}
          </button>
        </form>
      )}
    </div>
  );
}
