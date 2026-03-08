import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { transferAPI } from '../../utils/api';
import { Send, TrendingUp, Clock, CheckCircle, AlertCircle, ArrowRight, Plus, Shield } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const StatusBadge = ({ status }) => {
  const styles = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    sent: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-600',
  };
  return <span className={`badge ${styles[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>;
};

export default function DashboardPage() {
  const { user, isKYCApproved } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await transferAPI.getAll({ limit: 5 });
        setTransactions(res.data.transactions);
      } catch { }
      setLoading(false);
    };
    load();
  }, []);

  const chartData = [
    { month: 'Aug', amount: 0 },
    { month: 'Sep', amount: 200 },
    { month: 'Oct', amount: 450 },
    { month: 'Nov', amount: 300 },
    { month: 'Dec', amount: 800 },
    { month: 'Jan', amount: user?.totalAmountSent || 0 },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KYC banner */}
      {!isKYCApproved && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center">
              <Shield className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="font-semibold text-amber-900 text-sm">Complete KYC Verification</p>
              <p className="text-amber-700 text-xs">Verify your identity to start sending money</p>
            </div>
          </div>
          <Link to="/kyc" className="bg-amber-500 hover:bg-amber-600 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors flex-shrink-0">
            Verify Now
          </Link>
        </div>
      )}

      {/* Welcome + Quick stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Transfers', value: user?.totalTransfers || 0, icon: Send, color: 'text-primary-600 bg-primary-50' },
          { label: 'Amount Sent', value: `$${(user?.totalAmountSent || 0).toLocaleString()}`, icon: TrendingUp, color: 'text-green-600 bg-green-50' },
          { label: 'KYC Status', value: user?.kycStatus || 'Pending', icon: Shield, color: 'text-blue-600 bg-blue-50' },
          { label: 'Account Status', value: user?.isActive ? 'Active' : 'Inactive', icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${color}`}>
              <Icon size={20} />
            </div>
            <p className="text-xs text-gray-500 mb-1">{label}</p>
            <p className="text-xl font-bold text-gray-900 capitalize">{value}</p>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Chart */}
        <div className="lg:col-span-2 card">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-bold text-gray-900">Transfer History</h3>
            <span className="text-xs text-gray-400">Last 6 months</span>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorAmt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#1a3faa" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#1a3faa" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip formatter={(v) => [`$${v}`, 'Amount']} contentStyle={{ borderRadius: '8px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
              <Area type="monotone" dataKey="amount" stroke="#1a3faa" fill="url(#colorAmt)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Quick actions */}
        <div className="card">
          <h3 className="font-bold text-gray-900 mb-4">Quick Actions</h3>
          <div className="space-y-3">
            <Link to="/send-money" className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${isKYCApproved ? 'border-primary-100 hover:border-primary-300 hover:bg-primary-50' : 'border-gray-100 opacity-60 cursor-not-allowed'}`}>
              <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center">
                <Send className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Send Money</p>
                <p className="text-xs text-gray-400">{isKYCApproved ? 'Transfer internationally' : 'KYC required'}</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
            </Link>

            <Link to="/beneficiaries" className="flex items-center gap-3 p-3 rounded-xl border-2 border-gray-100 hover:border-blue-200 hover:bg-blue-50 transition-all">
              <div className="w-9 h-9 bg-blue-500 rounded-lg flex items-center justify-center">
                <Plus className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Add Recipient</p>
                <p className="text-xs text-gray-400">Manage beneficiaries</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
            </Link>

            <Link to="/transactions" className="flex items-center gap-3 p-3 rounded-xl border-2 border-gray-100 hover:border-green-200 hover:bg-green-50 transition-all">
              <div className="w-9 h-9 bg-green-500 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-800">Track Transfer</p>
                <p className="text-xs text-gray-400">View all transactions</p>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-400 ml-auto" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-gray-900">Recent Transfers</h3>
          <Link to="/transactions" className="text-sm text-primary-600 font-medium hover:text-primary-800 flex items-center gap-1">
            View all <ArrowRight size={14} />
          </Link>
        </div>
        
        {loading ? (
          <div className="space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-16 bg-gray-50 rounded-xl animate-pulse" />)}
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <Send className="w-8 h-8 text-gray-300" />
            </div>
            <p className="text-gray-400 text-sm">No transfers yet</p>
            {isKYCApproved && (
              <Link to="/send-money" className="btn-primary inline-flex items-center gap-2 mt-4 text-sm py-2 px-4">
                <Send size={14} /> Send Money
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {transactions.map(txn => (
              <Link key={txn._id} to={`/transactions/${txn._id}`} className="flex items-center justify-between p-4 rounded-xl hover:bg-gray-50 transition-colors border border-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center">
                    <Send className="w-4 h-4 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800 text-sm">
                      {txn.beneficiary?.firstName} {txn.beneficiary?.lastName}
                    </p>
                    <p className="text-xs text-gray-400">{txn.transactionId} · {new Date(txn.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-gray-900 text-sm">${txn.sendAmount.toLocaleString()} {txn.sendCurrency}</p>
                  <StatusBadge status={txn.status} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
