import { useState, useEffect } from 'react';
import { adminAPI } from '../../utils/api';
import { ScrollText, ChevronLeft, ChevronRight } from 'lucide-react';

const ResultBadge = ({ result }) => {
  const s = { success: 'bg-green-100 text-green-700', failure: 'bg-red-100 text-red-700', warning: 'bg-yellow-100 text-yellow-700' };
  return <span className={`badge ${s[result] || 'bg-gray-100 text-gray-600'}`}>{result}</span>;
};

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 0, pages: 1 });

  const load = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getAuditLogs({ page, limit: 25 });
      setLogs(res.data.logs);
      setPagination(res.data.pagination);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [page]);

  return (
    <div className="space-y-5 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Audit Logs</h1>
        <p className="text-sm text-gray-500 mt-1">Complete activity trail for compliance and security</p>
      </div>

      <div className="card overflow-hidden p-0">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <ScrollText size={18} className="text-primary-600" />
          <h3 className="font-bold text-gray-900">System Activity</h3>
          <span className="ml-auto text-sm text-gray-400">{pagination.total} total events</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Actor', 'Action', 'Resource', 'IP Address', 'Result', 'Timestamp'].map(h => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 px-5 py-3.5">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading
                ? [1, 2, 3, 4, 5].map(i => (
                    <tr key={i}><td colSpan={6} className="px-5 py-4"><div className="h-7 bg-gray-100 rounded animate-pulse" /></td></tr>
                  ))
                : logs.length === 0
                ? <tr><td colSpan={6} className="text-center py-12 text-gray-400">No logs found</td></tr>
                : logs.map(log => (
                  <tr key={log._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3.5">
                      {log.actor ? (
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{log.actor.firstName} {log.actor.lastName}</p>
                          <p className="text-xs text-gray-400 capitalize">{log.actorRole}</p>
                        </div>
                      ) : <span className="text-xs text-gray-400">System</span>}
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="text-xs font-mono bg-gray-100 text-gray-700 px-2 py-1 rounded-md">{log.action}</span>
                    </td>
                    <td className="px-5 py-3.5 text-sm text-gray-600">{log.resource || '-'}</td>
                    <td className="px-5 py-3.5 text-xs font-mono text-gray-500">{log.ipAddress || '-'}</td>
                    <td className="px-5 py-3.5"><ResultBadge result={log.result} /></td>
                    <td className="px-5 py-3.5 text-xs text-gray-500">{new Date(log.createdAt).toLocaleString()}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
        {pagination.pages > 1 && (
          <div className="flex items-center justify-between px-5 py-3 border-t border-gray-100">
            <p className="text-sm text-gray-500">Page {page} of {pagination.pages}</p>
            <div className="flex items-center gap-2">
              <button onClick={() => setPage(p => p - 1)} disabled={page === 1} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40"><ChevronLeft size={16} /></button>
              <span className="text-sm font-medium">{page} / {pagination.pages}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page === pagination.pages} className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-40"><ChevronRight size={16} /></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
