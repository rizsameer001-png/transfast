import { useState, useEffect } from 'react';
import { adminAPI } from '../../utils/api';
import { Search, AlertTriangle, Check, X, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const StatusBadge = ({ status }) => {
  const s = {
    pending: 'bg-yellow-100 text-yellow-700',
    processing: 'bg-blue-100 text-blue-700',
    sent: 'bg-purple-100 text-purple-700',
    delivered: 'bg-green-100 text-green-700',
    failed: 'bg-red-100 text-red-700',
    cancelled: 'bg-gray-100 text-gray-600',
  };
  return <span className={`badge ${s[status] || 'bg-gray-100 text-gray-600'}`}>{status}</span>;
};

const STATUSES = ['', 'pending', 'processing', 'sent', 'delivered', 'failed', 'cancelled'];

export default function AdminTransactions() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', flagged: '', search: '', page: 1 });
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [updating, setUpdating] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getTransactions({ ...filters, limit: 15 });
      setTransactions(res.data.transactions);
      setPagination(res.data.pagination);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [filters]);

  const updateStatus = async (id, status, note = '') => {
    setUpdating(id);
    try {
      await adminAPI.updateTransactionStatus(id, { status, note });
      toast.success('Status updated');
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed');
    }
    setUpdating(null);
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Transaction Monitoring</h1>
        <p className="text-sm text-gray-500 mt-1">Monitor and manage all platform transactions</p>
      </div>

      <div className="card py-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              className="input-field pl-9 text-sm"
              placeholder="Search transaction ID..."
              value={filters.search}
              onChange={e => setFilters(f => ({ ...f, search: e.target.value, page: 1 }))}
            />
          </div>
          <select
            className="input-field sm:w-44 text-sm"
            value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}
          >
            {STATUSES.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
          </select>
          <select
            className="input-field sm:w-44 text-sm"
            value={filters.flagged}
            onChange={e => setFilters(f => ({ ...f, flagged: e.target.value, page: 1 }))}
          >
            <option value="">All</option>
            <option value="true">Flagged Only</option>
          </select>
        </div>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['TXN ID', 'Sender', 'Recipient', 'Amount', 'Receives', 'Status', 'Flag', 'Date', 'Actions'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-4 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? [1, 2, 3, 4, 5].map(i => (
                    <tr key={i}><td colSpan={9} className="px-4 py-4"><div className="h-8 bg-gray-100 rounded animate-pulse" /></td></tr>
                  ))
                : transactions.length === 0
                ? <tr><td colSpan={9} className="text-center py-12 text-gray-400">No transactions found</td></tr>
                : transactions.map(txn => (
                  <tr key={txn._id} className={`hover:bg-gray-50 transition-colors ${txn.isFlagged ? 'bg-orange-50/30' : ''}`}>
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs text-gray-600">{txn.transactionId?.substring(0, 14)}...</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-medium text-gray-800">{txn.sender?.firstName} {txn.sender?.lastName}</p>
                      <p className="text-xs text-gray-400">{txn.sender?.country}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="text-sm font-medium text-gray-800">{txn.beneficiary?.firstName} {txn.beneficiary?.lastName}</p>
                      <p className="text-xs text-gray-400">{txn.receiveCountry}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-bold text-gray-900 text-sm">${txn.sendAmount?.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">{txn.sendCurrency}</p>
                    </td>
                    <td className="px-4 py-3.5">
                      <p className="font-semibold text-gray-800 text-sm">{txn.receiveAmount?.toLocaleString()}</p>
                      <p className="text-xs text-gray-400">{txn.receiveCurrency}</p>
                    </td>
                    <td className="px-4 py-3.5"><StatusBadge status={txn.status} /></td>
                    <td className="px-4 py-3.5">
                      {txn.isFlagged && (
                        <span className="badge bg-orange-100 text-orange-700 flex items-center gap-1">
                          <AlertTriangle size={10} /> Flagged
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-xs text-gray-500">{new Date(txn.createdAt).toLocaleDateString()}</td>
                    <td className="px-4 py-3.5">
                      {updating === txn._id ? (
                        <div className="w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <div className="flex items-center gap-1">
                          {txn.status === 'processing' && (
                            <button
                              onClick={() => updateStatus(txn._id, 'delivered', 'Marked delivered by admin')}
                              className="p-1.5 rounded-lg hover:bg-green-50 text-green-600"
                              title="Mark Delivered"
                            >
                              <Check size={14} />
                            </button>
                          )}
                          {['pending', 'processing'].includes(txn.status) && (
                            <button
                              onClick={() => updateStatus(txn._id, 'failed', 'Rejected by admin')}
                              className="p-1.5 rounded-lg hover:bg-red-50 text-red-500"
                              title="Reject"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">Total: {pagination.total} transactions</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))} disabled={filters.page === 1} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40"><ChevronLeft size={16} /></button>
              <span className="text-sm font-medium">{filters.page} / {pagination.pages}</span>
              <button onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))} disabled={filters.page === pagination.pages} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
