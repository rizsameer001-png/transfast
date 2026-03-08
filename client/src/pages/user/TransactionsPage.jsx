import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { transferAPI } from '../../utils/api';
import { Search, Filter, Send, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const StatusBadge = ({ status }) => {
  const styles = { pending: 'status-pending', processing: 'status-processing', sent: 'status-sent', delivered: 'status-delivered', failed: 'status-failed', cancelled: 'status-cancelled' };
  return <span className={styles[status] || 'badge bg-gray-100 text-gray-600'}>{status}</span>;
};

const STATUSES = ['', 'pending', 'processing', 'sent', 'delivered', 'failed', 'cancelled'];

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', search: '', page: 1 });
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const load = async () => {
    setLoading(true);
    try {
      const res = await transferAPI.getAll({ ...filters, limit: 10 });
      setTransactions(res.data.transactions);
      setPagination(res.data.pagination);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [filters]);

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
        <Link to="/send-money" className="btn-primary text-sm py-2 flex items-center gap-2"><Send size={14} /> Send Money</Link>
      </div>

      {/* Filters */}
      <div className="card py-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input className="input-field pl-9 text-sm" placeholder="Search by transaction ID..."
              value={filters.search} onChange={e => setFilters(f => ({...f, search: e.target.value, page: 1}))} />
          </div>
          <select className="input-field sm:w-44 text-sm" value={filters.status} onChange={e => setFilters(f => ({...f, status: e.target.value, page: 1}))}>
            {STATUSES.map(s => <option key={s} value={s}>{s || 'All Statuses'}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Transaction', 'Recipient', 'Amount', 'Receives', 'Status', 'Date', ''].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i}><td colSpan={7} className="px-5 py-4"><div className="h-8 bg-gray-100 rounded animate-pulse" /></td></tr>
                ))
              ) : transactions.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-16 text-gray-400">
                  <Send className="w-10 h-10 mx-auto mb-3 text-gray-200" />
                  <p>No transactions found</p>
                </td></tr>
              ) : transactions.map(txn => (
                <tr key={txn._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-4">
                    <p className="font-mono text-xs font-medium text-gray-600">{txn.transactionId}</p>
                  </td>
                  <td className="px-5 py-4">
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{txn.beneficiary?.firstName} {txn.beneficiary?.lastName}</p>
                      <p className="text-xs text-gray-400">{txn.receiveCountry}</p>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-bold text-gray-900">${txn.sendAmount.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{txn.sendCurrency}</p>
                  </td>
                  <td className="px-5 py-4">
                    <p className="font-semibold text-gray-800">{txn.receiveAmount?.toLocaleString()}</p>
                    <p className="text-xs text-gray-400">{txn.receiveCurrency}</p>
                  </td>
                  <td className="px-5 py-4"><StatusBadge status={txn.status} /></td>
                  <td className="px-5 py-4">
                    <p className="text-sm text-gray-600">{new Date(txn.createdAt).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-400">{new Date(txn.createdAt).toLocaleTimeString()}</p>
                  </td>
                  <td className="px-5 py-4">
                    <Link to={`/transactions/${txn._id}`} className="text-primary-600 hover:text-primary-800">
                      <ArrowRight size={16} />
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">Total: {pagination.total} transactions</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setFilters(f => ({...f, page: f.page - 1}))} disabled={filters.page === 1} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40"><ChevronLeft size={16} /></button>
              <span className="text-sm font-medium">{filters.page} / {pagination.pages}</span>
              <button onClick={() => setFilters(f => ({...f, page: f.page + 1}))} disabled={filters.page === pagination.pages} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
