import { useState, useEffect } from 'react';
import { adminAPI } from '../../utils/api';
import { Search, Check, X, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import toast from 'react-hot-toast';

const StatusBadge = ({ status }) => {
  const s = {
    pending: 'bg-yellow-100 text-yellow-700',
    under_review: 'bg-blue-100 text-blue-700',
    approved: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  };
  return <span className={`badge ${s[status] || 'bg-gray-100 text-gray-600'}`}>{status?.replace('_', ' ')}</span>;
};

function KYCDetailModal({ kyc, onClose, onAction }) {
  const [reason, setReason] = useState('');
  const [acting, setActing] = useState(false);

  if (!kyc) return null;

  const handleAction = async (action) => {
    setActing(true);
    await onAction(kyc._id, action, reason);
    setActing(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">KYC Review</h2>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100"><X size={18} /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-sm font-semibold text-gray-700 mb-3">Applicant</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-gray-400 text-xs">Name</p><p className="font-semibold">{kyc.user?.firstName} {kyc.user?.lastName}</p></div>
              <div><p className="text-gray-400 text-xs">Email</p><p className="font-semibold">{kyc.user?.email}</p></div>
              <div><p className="text-gray-400 text-xs">Country</p><p className="font-semibold">{kyc.user?.country}</p></div>
              <div><p className="text-gray-400 text-xs">Nationality</p><p className="font-semibold">{kyc.nationality}</p></div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-sm">
            <div><p className="text-gray-400 text-xs mb-1">Date of Birth</p><p className="font-semibold">{kyc.dateOfBirth ? new Date(kyc.dateOfBirth).toLocaleDateString() : '-'}</p></div>
            <div><p className="text-gray-400 text-xs mb-1">ID Type</p><p className="font-semibold capitalize">{kyc.idType?.replace('_', ' ')}</p></div>
            <div><p className="text-gray-400 text-xs mb-1">ID Number</p><p className="font-semibold">{kyc.idNumber}</p></div>
            <div><p className="text-gray-400 text-xs mb-1">Source of Funds</p><p className="font-semibold capitalize">{kyc.sourceOfFunds}</p></div>
          </div>

          {kyc.address && (
            <div className="bg-gray-50 rounded-xl p-4 text-sm">
              <p className="text-gray-500 text-xs font-semibold mb-2 uppercase tracking-wide">Address</p>
              <p className="text-gray-800">{kyc.address.street}, {kyc.address.city}</p>
              <p className="text-gray-800">{kyc.address.state} {kyc.address.postalCode}, {kyc.address.country}</p>
            </div>
          )}

          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">Documents</p>
            <div className="grid grid-cols-2 gap-3">
              {['ID Front', 'ID Back', 'Selfie', 'Proof of Address'].map(d => (
                <div key={d} className="border border-dashed border-gray-200 rounded-xl p-4 text-center text-xs text-gray-400">
                  <Eye size={20} className="mx-auto mb-1 text-gray-300" />{d}<br />(file upload in production)
                </div>
              ))}
            </div>
          </div>

          {kyc.status !== 'approved' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Rejection Reason (if rejecting)</label>
              <input className="input-field" placeholder="e.g. ID expired, unclear document..." value={reason} onChange={e => setReason(e.target.value)} />
            </div>
          )}
        </div>
        {kyc.status === 'under_review' && (
          <div className="p-6 border-t border-gray-100 flex gap-3">
            <button onClick={() => handleAction('reject')} disabled={acting} className="btn-danger flex-1 flex items-center justify-center gap-2"><X size={16} /> Reject</button>
            <button onClick={() => handleAction('approve')} disabled={acting} className="btn-primary flex-1 flex items-center justify-center gap-2"><Check size={16} /> Approve</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminKYC() {
  const [kycList, setKycList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: 'under_review', page: 1 });
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [selected, setSelected] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getKYCList({ ...filters, limit: 15 });
      setKycList(res.data.kycList);
      setPagination(res.data.pagination);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [filters]);

  const handleAction = async (id, action, reason) => {
    try {
      await adminAPI.reviewKYC(id, { action, reason });
      toast.success(`KYC ${action}d successfully`);
      load();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Action failed');
    }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">KYC Review</h1>
        <p className="text-sm text-gray-500 mt-1">Review and approve identity verification submissions</p>
      </div>

      <div className="card py-4">
        <div className="flex gap-3">
          <select
            className="input-field sm:w-52 text-sm"
            value={filters.status}
            onChange={e => setFilters(f => ({ ...f, status: e.target.value, page: 1 }))}
          >
            <option value="">All Submissions</option>
            <option value="under_review">Under Review</option>
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
                {['Applicant', 'ID Type', 'Source of Funds', 'Submitted', 'Status', 'Action'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? [1, 2, 3].map(i => (
                    <tr key={i}><td colSpan={6} className="px-5 py-4"><div className="h-8 bg-gray-100 rounded animate-pulse" /></td></tr>
                  ))
                : kycList.length === 0
                ? <tr><td colSpan={6} className="text-center py-12 text-gray-400">No KYC submissions found</td></tr>
                : kycList.map(kyc => (
                  <tr key={kyc._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-blue-100 rounded-full flex items-center justify-center text-blue-700 font-bold text-sm flex-shrink-0">
                          {kyc.user?.firstName?.[0]}{kyc.user?.lastName?.[0]}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-800 text-sm">{kyc.user?.firstName} {kyc.user?.lastName}</p>
                          <p className="text-xs text-gray-400">{kyc.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-600 capitalize">{kyc.idType?.replace('_', ' ')}</td>
                    <td className="px-5 py-4 text-sm text-gray-600 capitalize">{kyc.sourceOfFunds}</td>
                    <td className="px-5 py-4 text-sm text-gray-500">{kyc.submittedAt ? new Date(kyc.submittedAt).toLocaleDateString() : '-'}</td>
                    <td className="px-5 py-4"><StatusBadge status={kyc.status} /></td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => setSelected(kyc)}
                        className="flex items-center gap-1.5 text-sm text-primary-600 hover:text-primary-800 font-medium"
                      >
                        <Eye size={14} /> Review
                      </button>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">Total: {pagination.total}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setFilters(f => ({ ...f, page: f.page - 1 }))} disabled={filters.page === 1} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40"><ChevronLeft size={16} /></button>
              <span className="text-sm font-medium">{filters.page} / {pagination.pages}</span>
              <button onClick={() => setFilters(f => ({ ...f, page: f.page + 1 }))} disabled={filters.page === pagination.pages} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>

      <KYCDetailModal kyc={selected} onClose={() => setSelected(null)} onAction={handleAction} />
    </div>
  );
}
