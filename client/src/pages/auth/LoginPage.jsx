import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { Globe, Eye, EyeOff, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.firstName}!`);
      navigate(['admin', 'compliance', 'support'].includes(user.role) ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Left panel */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-800 to-primary-900 flex-col items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary-700 rounded-full blur-3xl opacity-30" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-500 rounded-full blur-3xl opacity-20" />
        <div className="relative z-10 text-center">
          <div className="flex items-center justify-center gap-3 mb-12">
            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
              <Globe className="w-7 h-7 text-white" />
            </div>
            <span className="text-3xl font-bold text-white">TransFast</span>
          </div>
          <h2 className="text-4xl font-bold text-white mb-4 leading-tight">Send money<br />across borders</h2>
          <p className="text-primary-200 text-lg mb-12">Fast, secure, and competitive rates</p>
          <div className="space-y-4">
            {['100+ countries covered', 'Real-time exchange rates', 'Bank-grade security', 'Low transfer fees'].map(f => (
              <div key={f} className="flex items-center gap-3 text-primary-100">
                <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs">✓</span>
                </div>
                <span className="text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Globe className="w-7 h-7 text-primary-600" />
            <span className="text-2xl font-bold text-primary-800">TransFast</span>
          </div>
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome back</h1>
            <p className="text-gray-500">Sign in to your account to continue</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-gray-400" size={18} />
                <input
                  type="email" required
                  className="input-field pl-11"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={e => setForm({...form, email: e.target.value})}
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-gray-700">Password</label>
                <Link to="/forgot-password" className="text-sm text-primary-600 hover:text-primary-800 font-medium">Forgot password?</Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input
                  type={showPass ? 'text' : 'password'} required
                  className="input-field pl-11 pr-11"
                  placeholder="Your password"
                  value={form.password}
                  onChange={e => setForm({...form, password: e.target.value})}
                />
                <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              {loading ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-primary-600 font-semibold hover:text-primary-800">Create account</Link>
            </p>
          </div>

          {/* Demo credentials */}
          <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
            <p className="text-xs font-semibold text-blue-700 mb-2">Demo Credentials</p>
            <div className="space-y-1 text-xs text-blue-600">
              <p>👤 User: john@example.com / User@12345</p>
              <p>🛡️ Admin: admin@transfast.com / Admin@123456</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
