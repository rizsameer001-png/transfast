import { useState, useEffect } from 'react';
import { beneficiaryAPI } from '../../utils/api';
import { Plus, Edit2, Trash2, Users, Building, Globe, Smartphone } from 'lucide-react';
import toast from 'react-hot-toast';

const PAYOUT_ICONS = { bank_deposit: Building, mobile_wallet: Smartphone, cash_pickup: Globe };

function BeneficiaryModal({ open, onClose, onSave, editing }) {
  const [form, setForm] = useState({ firstName: '', lastName: '', country: '', currency: '', phone: '', relationship: 'family', payoutMethod: 'bank_deposit', bankDetails: { bankName: '', accountNumber: '' }, ...editing });
  const [saving, setSaving] = useState(false);
  const u = (f, v) => setForm(p => ({ ...p, [f]: v }));

  useEffect(() => { if (editing) setForm({ bankDetails: {}, walletDetails: {}, ...editing }); }, [editing]);

  if (!open) return null;

  const handleSave = async () => {
    if (!form.firstName || !form.country || !form.currency) return toast.error('Fill required fields');
    setSaving(true);
    try {
      await onSave(form);
      onClose();
    } catch (err) { toast.error(err.response?.data?.message || 'Error saving'); }
    setSaving(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">{editing ? 'Edit' : 'Add'} Recipient</h2>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">First Name *</label><input className="input-field" value={form.firstName} onChange={e => u('firstName', e.target.value)} /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Last Name *</label><input className="input-field" value={form.lastName} onChange={e => u('lastName', e.target.value)} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Country *</label><input className="input-field" placeholder="e.g. PK, IN" value={form.country} onChange={e => u('country', e.target.value)} /></div>
            <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Currency *</label><input className="input-field" placeholder="e.g. PKR, INR" value={form.currency} onChange={e => u('currency', e.target.value)} /></div>
          </div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label><input className="input-field" value={form.phone} onChange={e => u('phone', e.target.value)} /></div>
          <div><label className="block text-sm font-semibold text-gray-700 mb-1.5">Payout Method</label>
            <select className="input-field" value={form.payoutMethod} onChange={e => u('payoutMethod', e.target.value)}>
              <option value="bank_deposit">Bank Deposit</option>
              <option value="mobile_wallet">Mobile Wallet</option>
              <option value="cash_pickup">Cash Pickup</option>
            </select>
          </div>
          {form.payoutMethod === 'bank_deposit' && (
            <div className="space-y-3 bg-gray-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-700">Bank Details</p>
              <input className="input-field text-sm" placeholder="Bank Name" value={form.bankDetails?.bankName || ''} onChange={e => setForm(p => ({...p, bankDetails: {...p.bankDetails, bankName: e.target.value}}))} />
              <input className="input-field text-sm" placeholder="Account Number" value={form.bankDetails?.accountNumber || ''} onChange={e => setForm(p => ({...p, bankDetails: {...p.bankDetails, accountNumber: e.target.value}}))} />
            </div>
          )}
          {form.payoutMethod === 'mobile_wallet' && (
            <div className="space-y-3 bg-gray-50 rounded-xl p-4">
              <p className="text-sm font-semibold text-gray-700">Wallet Details</p>
              <input className="input-field text-sm" placeholder="Wallet Provider (e.g. EasyPaisa)" value={form.walletDetails?.walletProvider || ''} onChange={e => setForm(p => ({...p, walletDetails: {...p.walletDetails, walletProvider: e.target.value}}))} />
              <input className="input-field text-sm" placeholder="Wallet Number" value={form.walletDetails?.walletNumber || ''} onChange={e => setForm(p => ({...p, walletDetails: {...p.walletDetails, walletNumber: e.target.value}}))} />
            </div>
          )}
        </div>
        <div className="p-6 border-t border-gray-100 flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">{saving ? 'Saving...' : 'Save Recipient'}</button>
        </div>
      </div>
    </div>
  );
}

export default function BeneficiariesPage() {
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  const load = async () => {
    try { const r = await beneficiaryAPI.getAll(); setBeneficiaries(r.data.beneficiaries); } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleSave = async (form) => {
    if (editing) { await beneficiaryAPI.update(editing._id, form); toast.success('Updated!'); }
    else { await beneficiaryAPI.add(form); toast.success('Recipient added!'); }
    load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Remove this recipient?')) return;
    try { await beneficiaryAPI.remove(id); toast.success('Removed'); load(); } catch { toast.error('Error'); }
  };

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Recipients</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your transfer recipients</p>
        </div>
        <button onClick={() => { setEditing(null); setModalOpen(true); }} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Add Recipient
        </button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">{[1,2,3].map(i => <div key={i} className="card h-32 animate-pulse bg-gray-50" />)}</div>
      ) : beneficiaries.length === 0 ? (
        <div className="card text-center py-16">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4"><Users className="w-8 h-8 text-gray-300" /></div>
          <p className="text-gray-500 mb-2 font-medium">No recipients yet</p>
          <p className="text-sm text-gray-400 mb-6">Add your first recipient to start sending money</p>
          <button onClick={() => { setEditing(null); setModalOpen(true); }} className="btn-primary inline-flex items-center gap-2 text-sm"><Plus size={14} /> Add Recipient</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {beneficiaries.map(b => {
            const Icon = PAYOUT_ICONS[b.payoutMethod] || Globe;
            return (
              <div key={b._id} className="card hover:shadow-md transition-all duration-200">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold text-sm">{b.firstName[0]}{b.lastName[0]}</div>
                    <div>
                      <p className="font-bold text-gray-900">{b.firstName} {b.lastName}</p>
                      <p className="text-xs text-gray-500">{b.country} · {b.currency}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => { setEditing(b); setModalOpen(true); }} className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-700"><Edit2 size={14} /></button>
                    <button onClick={() => handleDelete(b._id)} className="p-1.5 rounded-lg hover:bg-red-50 text-gray-400 hover:text-red-600"><Trash2 size={14} /></button>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Icon size={14} className="text-gray-400" />
                  <span className="text-xs text-gray-500 capitalize">{b.payoutMethod?.replace('_', ' ')}</span>
                  {b.bankDetails?.bankName && <span className="text-xs text-gray-400">· {b.bankDetails.bankName}</span>}
                </div>
                {b.totalTransfers > 0 && <p className="text-xs text-gray-400 mt-2">{b.totalTransfers} previous transfers</p>}
              </div>
            );
          })}
        </div>
      )}

      <BeneficiaryModal open={modalOpen} onClose={() => setModalOpen(false)} onSave={handleSave} editing={editing} />
    </div>
  );
}
