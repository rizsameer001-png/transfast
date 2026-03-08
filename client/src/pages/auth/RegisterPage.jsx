import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Globe, Eye, EyeOff } from 'lucide-react';

const COUNTRIES = [
  'United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France',
  'UAE', 'Saudi Arabia', 'Qatar', 'Kuwait', 'Singapore', 'Malaysia', 'Other'
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', phone: '', password: '', country: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const update = (field, val) => setForm(f => ({ ...f, [field]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 8) return toast.error('Password must be at least 8 characters');
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Complete KYC to start sending.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div className="hidden lg:flex lg:w-5/12 bg-gradient-to-br from-primary-800 to-primary-900 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-700 rounded-full blur-3xl opacity-30" />
        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-10">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Globe className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold text-white">TransFast</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">Join millions of<br />global senders</h2>
          <p className="text-primary-200 mb-8">Create your free account today</p>
          <div className="bg-white/10 rounded-2xl p-6 text-left space-y-3">
            {['Free to create account', 'Send money in minutes', 'Track transfers in real-time', 'Multiple payout options'].map(f => (
              <div key={f} className="flex items-center gap-3 text-white text-sm">
                <span className="w-5 h-5 bg-accent-500 rounded-full flex items-center justify-center text-xs">✓</span>
                {f}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 lg:p-10 bg-white overflow-y-auto">
        <div className="w-full max-w-lg py-8">
          <div className="lg:hidden flex items-center gap-2 mb-6">
            <Globe className="w-7 h-7 text-primary-600" />
            <span className="text-2xl font-bold text-primary-800">TransFast</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Create Account</h1>
            <p className="text-gray-500">Fill in your details to get started</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">First Name</label>
                <input required className="input-field" placeholder="John" value={form.firstName} onChange={e => update('firstName', e.target.value)} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Last Name</label>
                <input required className="input-field" placeholder="Smith" value={form.lastName} onChange={e => update('lastName', e.target.value)} />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <input type="email" required className="input-field" placeholder="john@example.com" value={form.email} onChange={e => update('email', e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone Number</label>
              <input type="tel" required className="input-field" placeholder="+1 (234) 567-8901" value={form.phone} onChange={e => update('phone', e.target.value)} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Country of Residence</label>
              <select required className="input-field" value={form.country} onChange={e => update('country', e.target.value)}>
                <option value="">Select country</option>
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} required className="input-field pr-11" placeholder="Min. 8 characters" value={form.password} onChange={e => update('password', e.target.value)} />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <p className="text-xs text-gray-400 mt-2">
              By registering, you agree to our{' '}
              <a href="#" className="text-primary-600 font-medium">Terms of Service</a> and{' '}
              <a href="#" className="text-primary-600 font-medium">Privacy Policy</a>.
            </p>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating account...</> : 'Create Account'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-800">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
