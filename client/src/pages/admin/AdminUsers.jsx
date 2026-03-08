import { useState, useEffect } from 'react';
import { adminAPI } from '../../utils/api';
import { Search, UserX, UserCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const KYCBadge = ({ status }) => {
  const s = {
    pending: 'bg-yellow-100 text-yellow-700',
    submitted: 'bg-blue-100 text-blue-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };
  return <span className={`badge ${s[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>;
};

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', kycStatus: '', page: 1 });
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getUsers({ ...filters, limit: 15 });
      setUsers(res.data.users);
      setPagination(res.data.pagination);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [filters]);

  const handleAction = async (userId, action, reason = 'Admin action') => {
    try {
      await adminAPI.toggleUserStatus(userId, { action, reason });
      toast.success(`User ${action}d successfully`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">User Management</h1>
        <p className="text-sm text-gray-500 mt-1">Manage all registered user accounts</p>
      </div>

      <div className="card py-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              className="input-field pl-9 text-sm"
              placeholder="Search by name, email, phone..."
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))}
            />
          </div>
          <select
            className="input-field sm:w-44 text-sm"
            value={filters.kycStatus}
            onChange={e => setFilters(f => ({ ...f, kycStatus: e.target.value, page: 1 }))}
          >
            <option value="">All KYC Status</option>
            <option value="pending">Pending</option>
            <option value="submitted">Submitted</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['User', 'Country', 'KYC Status', 'Transfers', 'Joined', 'Account Status', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? [1, 2, 3, 4, 5].map(i => (
                    <tr key={i}>
                      <td colSpan={7} className="px-5 py-4">
                        <div className="h-8 bg-gray-100 rounded animate-pulse" />
                      </td>
                    </tr>
                  ))
                : users.length === 0
                ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-gray-400">No users found</td>
                  </tr>
                )
                : users.map(u => (
                  <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-sm flex-shrink-0">
                          {u.firstName[0]}{u.lastName[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{u.firstName} {u.lastName}</p>
                          <p className="text-xs text-gray-400">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600">{u.country}</td>
                    <td className="px-5 py-4"><KYCBadge status={u.kycStatus} /></td>
                    <td className="px-5 py-4 text-sm text-gray-600">{u.totalTransfers}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="px-5 py-4">
                      {u.isSuspended
                        ? <span className="badge bg-red-100 text-red-700">Suspended</span>
                        : u.isActive
                        ? <span className="badge bg-green-100 text-green-700">Active</span>
                        : <span className="badge bg-gray-100 text-gray-600">Inactive</span>}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1">
                        {u.isSuspended ? (
                          <button
                            onClick={() => handleAction(u._id, 'activate')}
                            className="p-1.5 rounded-lg hover:bg-green-50 text-green-600 transition-colors"
                            title="Activate"
                          >
                            <UserCheck size={15} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleAction(u._id, 'suspend')}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-red-500 transition-colors"
                            title="Suspend"
                          >
                            <UserX size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">Total: {pagination.total} users</p>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))}
                disabled={filters.page === 1}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-medium">{filters.page} / {pagination.pages}</span>
              <button
                onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))}
                disabled={filters.page === pagination.pages}
                className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
