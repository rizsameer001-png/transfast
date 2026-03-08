import { useState, useEffect } from 'react';
import { adminAPI } from '../../utils/api';
import { Users, ArrowLeftRight, FileCheck, AlertTriangle, DollarSign, TrendingUp, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const COLORS = ['#1a3faa', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard().then(r => setStats(r.data.stats)).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[1,2,3,4].map(i => <div key={i} className="card h-28 animate-pulse bg-gray-50" />)}
    </div>
  );

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers?.toLocaleString() || 0, sub: `${stats?.activeUsers} active`, icon: Users, color: 'text-blue-600 bg-blue-50' },
    { label: 'Total Transactions', value: stats?.totalTransactions?.toLocaleString() || 0, sub: `${stats?.todayTransactions} today`, icon: ArrowLeftRight, color: 'text-purple-600 bg-purple-50' },
    { label: 'Total Volume', value: `$${(stats?.totalVolume || 0).toLocaleString()}`, sub: 'All time', icon: DollarSign, color: 'text-green-600 bg-green-50' },
    { label: 'Pending KYC', value: stats?.pendingKYC || 0, sub: 'Awaiting review', icon: FileCheck, color: 'text-orange-600 bg-orange-50' },
    { label: 'Flagged Transactions', value: stats?.flaggedTransactions || 0, sub: 'Need review', icon: AlertTriangle, color: 'text-red-600 bg-red-50' },
    { label: "Today's Transfers", value: stats?.todayTransactions || 0, sub: 'New transfers', icon: Activity, color: 'text-indigo-600 bg-indigo-50' },
  ];

  const chartData = (stats?.monthlyVolume || []).map(m => ({
    month: MONTHS[m._id.month - 1],
    volume: m.volume,
    count: m.count
  }));

  const pieData = (stats?.statusBreakdown || []).map(s => ({ name: s._id, value: s.count }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">Overview of your remittance platform</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map(({ label, value, sub, icon: Icon, color }) => (
          <div key={label} className="card">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs text-gray-500 mb-1">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-xs text-gray-400 mt-0.5">{sub}</p>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
                <Icon size={18} />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Bar chart */}
        <div className="card">
          <h3 className="font-bold text-gray-900 mb-5">Monthly Transfer Volume</h3>
          {chartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                <Tooltip formatter={(v, n) => [n === 'volume' ? `$${v.toLocaleString()}` : v, n]} contentStyle={{ borderRadius: '10px', border: '1px solid #e5e7eb', fontSize: '12px' }} />
                <Bar dataKey="volume" fill="#1a3faa" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data yet</div>}
        </div>

        {/* Pie chart */}
        <div className="card">
          <h3 className="font-bold text-gray-900 mb-5">Transaction Status Breakdown</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={3} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Legend iconType="circle" iconSize={10} formatter={(v) => <span style={{ fontSize: '12px' }}>{v}</span>} />
                <Tooltip contentStyle={{ borderRadius: '10px', fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No data yet</div>}
        </div>
      </div>
    </div>
  );
}
