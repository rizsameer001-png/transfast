import { useState, useEffect } from 'react';
import { adminAPI } from '../../utils/api';
import { Search, Check, X, Eye, ChevronLeft, ChevronRight, FileText, ZoomIn } from 'lucide-react';
import toast from 'react-hot-toast';

const SERVER_URL = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';

const StatusBadge = ({ status }) => {
  const s = {
    pending:      'bg-yellow-100 text-yellow-700',
    under_review: 'bg-blue-100 text-blue-700',
    approved:     'bg-green-100 text-green-700',
    rejected:     'bg-red-100 text-red-700',
  };
  return <span className={`badge ${s[status] || 'bg-gray-100 text-gray-600'}`}>{status?.replace('_', ' ')}</span>;
};

// ── Document viewer card ──────────────────────────────────────────────────
function DocCard({ label, path }) {
  const [zoomed, setZoomed] = useState(false);
  const url = path ? `${SERVER_URL}/${path}` : null;
  const isPDF = path?.toLowerCase().endsWith('.pdf');

  return (
    <>
      <div className="border border-gray-100 rounded-xl overflow-hidden">
        {url ? (
          isPDF ? (
            <a href={url} target="_blank" rel="noreferrer"
              className="w-full h-32 flex flex-col items-center justify-center gap-2 bg-red-50 hover:bg-red-100 transition-colors cursor-pointer">
              <FileText size={28} className="text-red-400" />
              <span className="text-xs text-gray-500 font-medium">View PDF</span>
            </a>
          ) : (
            <button type="button" onClick={() => setZoomed(true)} className="w-full group relative">
              <img src={url} alt={label} className="w-full h-32 object-cover" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                <ZoomIn size={22} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </button>
          )
        ) : (
          <div className="w-full h-32 flex items-center justify-center bg-gray-50">
            <span className="text-xs text-gray-300">Not uploaded</span>
          </div>
        )}
        <div className="px-3 py-1.5 border-t border-gray-100 flex items-center gap-1.5">
          <span className="text-xs font-semibold text-gray-500">{label}</span>
          {url && <Check size={11} className="ml-auto text-green-500 flex-shrink-0" />}
        </div>
      </div>

      {/* Lightbox */}
      {zoomed && url && (
        <div
          className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center p-4"
          onClick={() => setZoomed(false)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20"
            onClick={() => setZoomed(false)}
          >
            <X size={20} className="text-white" />
          </button>
          <img
            src={url}
            alt={label}
            className="max-w-full max-h-[85vh] rounded-xl shadow-2xl object-contain"
            onClick={e => e.stopPropagation()}
          />
          <span className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm">{label}</span>
        </div>
      )}
    </>
  );
}

// ── KYC Detail Modal ──────────────────────────────────────────────────────
function KYCDetailModal({ kyc, onClose, onAction }) {
  const [reason, setReason] = useState('');
  const [acting, setActing] = useState(null);

  if (!kyc) return null;

  const handleAction = async (action) => {
    if (action === 'reject' && !reason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    setActing(action);
    await onAction(kyc._id, action, reason);
    setActing(null);
    onClose();
  };

  const docs = [
    { label: 'ID Front',         key: 'idFrontImage' },
    { label: 'ID Back',          key: 'idBackImage' },
    { label: 'Selfie',           key: 'selfieImage' },
    { label: 'Proof of Address', key: 'proofOfAddress' },
  ];
  const hasAnyDoc = docs.some(d => kyc[d.key]);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto shadow-2xl">

        {/* Header */}
        <div className="p-6 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-gray-900">KYC Review</h2>
            <StatusBadge status={kyc.status} />
          </div>
          <button onClick={onClose} className="p-2 rounded-xl hover:bg-gray-100 transition-colors">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">

          {/* Applicant info */}
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Applicant</p>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-gray-400 text-xs mb-0.5">Full Name</p><p className="font-semibold">{kyc.user?.firstName} {kyc.user?.lastName}</p></div>
              <div><p className="text-gray-400 text-xs mb-0.5">Email</p><p className="font-semibold text-primary-700">{kyc.user?.email}</p></div>
              <div><p className="text-gray-400 text-xs mb-0.5">Country</p><p className="font-semibold">{kyc.user?.country}</p></div>
              <div><p className="text-gray-400 text-xs mb-0.5">Nationality</p><p className="font-semibold">{kyc.nationality}</p></div>
            </div>
          </div>

          {/* Personal details */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-400 text-xs mb-1">Date of Birth</p>
              <p className="font-semibold">{kyc.dateOfBirth ? new Date(kyc.dateOfBirth).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : '—'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-400 text-xs mb-1">Occupation</p>
              <p className="font-semibold capitalize">{kyc.occupation || '—'}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-400 text-xs mb-1">ID Type</p>
              <p className="font-semibold capitalize">{kyc.idType?.replace('_', ' ')}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-400 text-xs mb-1">ID Number</p>
              <p className="font-semibold font-mono">{kyc.idNumber}</p>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <p className="text-gray-400 text-xs mb-1">Source of Funds</p>
              <p className="font-semibold capitalize">{kyc.sourceOfFunds}</p>
            </div>
            {kyc.idExpiryDate && (
              <div className="bg-gray-50 rounded-xl p-3">
                <p className="text-gray-400 text-xs mb-1">ID Expiry</p>
                <p className="font-semibold">{new Date(kyc.idExpiryDate).toLocaleDateString()}</p>
              </div>
            )}
          </div>

          {/* Address */}
          {kyc.address && (
            <div className="bg-gray-50 rounded-xl p-4 text-sm">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Residential Address</p>
              <p className="text-gray-800">{kyc.address.street}</p>
              <p className="text-gray-800">{kyc.address.city}{kyc.address.state ? `, ${kyc.address.state}` : ''} {kyc.address.postalCode}</p>
              <p className="text-gray-800 font-semibold">{kyc.address.country}</p>
            </div>
          )}

          {/* Submitted Date */}
          {kyc.submittedAt && (
            <p className="text-xs text-gray-400">
              Submitted: {new Date(kyc.submittedAt).toLocaleString()}
            </p>
          )}

          {/* Documents */}
          <div>
            <p className="text-sm font-bold text-gray-800 mb-3">Uploaded Documents</p>
            {!hasAnyDoc ? (
              <div className="border border-dashed border-gray-200 rounded-xl p-6 text-center">
                <p className="text-sm text-gray-400">No documents uploaded yet</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {docs.map(d => <DocCard key={d.key} label={d.label} path={kyc[d.key]} />)}
              </div>
            )}
          </div>

          {/* Rejection reason */}
          {kyc.status === 'under_review' && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Rejection Reason <span className="text-gray-400 font-normal">(required if rejecting)</span>
              </label>
              <textarea
                rows={2}
                className="input-field resize-none"
                placeholder="e.g. ID expired, document unclear, selfie doesn't match..."
                value={reason}
                onChange={e => setReason(e.target.value)}
              />
            </div>
          )}

          {/* Prior rejection reason */}
          {kyc.status === 'rejected' && kyc.rejectedReason && (
            <div className="bg-red-50 border border-red-100 rounded-xl p-4">
              <p className="text-xs font-semibold text-red-600 mb-1">Rejection Reason</p>
              <p className="text-sm text-red-700">{kyc.rejectedReason}</p>
            </div>
          )}
        </div>

        {/* Action footer */}
        {kyc.status === 'under_review' && (
          <div className="p-6 border-t border-gray-100 flex gap-3 sticky bottom-0 bg-white">
            <button
              onClick={() => handleAction('reject')}
              disabled={!!acting}
              className="btn-danger flex-1 flex items-center justify-center gap-2"
            >
              {acting === 'reject'
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <X size={16} />}
              Reject
            </button>
            <button
              onClick={() => handleAction('approve')}
              disabled={!!acting}
              className="btn-primary flex-1 flex items-center justify-center gap-2"
            >
              {acting === 'approve'
                ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <Check size={16} />}
              Approve
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Admin KYC Page ───────────────────────────────────────────────────
export default function AdminKYC() {
  const [kycList, setKycList]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [filters, setFilters]       = useState({ status: 'under_review', page: 1 });
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });
  const [selected, setSelected]     = useState(null);

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

      {/* Filter */}
      <div className="card py-4">
        <div className="flex items-center gap-3">
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
          <span className="text-sm text-gray-400 ml-auto">
            {pagination.total} submission{pagination.total !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Applicant', 'ID Type', 'Source of Funds', 'Documents', 'Submitted', 'Status', 'Action'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? [1, 2, 3].map(i => (
                    <tr key={i}><td colSpan={7} className="px-5 py-4">
                      <div className="h-8 bg-gray-100 rounded animate-pulse" />
                    </td></tr>
                  ))
                : kycList.length === 0
                ? <tr><td colSpan={7} className="text-center py-12 text-gray-400">No KYC submissions found</td></tr>
                : kycList.map(kyc => {
                    const docCount = ['idFrontImage','idBackImage','selfieImage','proofOfAddress'].filter(k => kyc[k]).length;
                    return (
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
                        <td className="px-5 py-4">
                          <div className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full ${docCount === 4 ? 'bg-green-100 text-green-700' : docCount > 0 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-500'}`}>
                            {docCount > 0 ? <Check size={11} /> : null}
                            {docCount}/4 files
                          </div>
                        </td>
                        <td className="px-5 py-4 text-sm text-gray-500">
                          {kyc.submittedAt ? new Date(kyc.submittedAt).toLocaleDateString() : '—'}
                        </td>
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
                    );
                  })}
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
