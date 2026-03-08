import { useState } from 'react';
import { Link } from 'react-router-dom';
import { authAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { Globe, Mail, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
      toast.success('Password reset email sent!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error sending email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      <div className="w-full max-w-md">
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold text-primary-800">TransFast</span>
        </div>

        <div className="card">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Email Sent!</h2>
              <p className="text-gray-500 mb-6">Check your inbox for password reset instructions.</p>
              <Link to="/login" className="btn-primary inline-block">Back to Login</Link>
            </div>
          ) : (
            <>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h1>
              <p className="text-gray-500 mb-6">Enter your email and we'll send reset instructions.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
                  <input type="email" required className="input-field" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full py-3">
                  {loading ? 'Sending...' : 'Send Reset Email'}
                </button>
              </form>
              <Link to="/login" className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mt-4 justify-center">
                <ArrowLeft size={16} /> Back to Login
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
