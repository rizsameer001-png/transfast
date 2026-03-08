import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { transferAPI } from '../../utils/api';
import { ArrowLeft, Check, Clock, X, Send, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const STATUS_STEPS = ['pending', 'processing', 'sent', 'delivered'];

export default function TransactionDetailPage() {
  const { id } = useParams();
  const [txn, setTxn] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    transferAPI.getOne(id).then(r => setTxn(r.data.transaction)).catch(() => {}).finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    try {
      const res = await transferAPI.cancel(id);
      setTxn(res.data.transaction);
      toast.success('Transfer cancelled');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cannot cancel');
    }
  };

  if (loading) return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600" /></div>;
  if (!txn) return <div className="card text-center py-10"><p className="text-gray-500">Transaction not found</p></div>;

  const currentStepIdx = STATUS_STEPS.indexOf(txn.status);

  return (
    <div className="max-w-2xl mx-auto space-y-5 animate-fade-in">
      <div className="flex items-center gap-3">
        <Link to="/transactions" className="p-2 rounded-xl hover:bg-gray-100"><ArrowLeft size={20} /></Link>
        <div>
          <h1 className="text-xl font-bold text-gray-900">Transfer Details</h1>
          <p className="text-sm text-gray-500 font-mono">{txn.transactionId}</p>
        </div>
      </div>

      {/* Amount card */}
      <div className="bg-gradient-to-r from-primary-700 to-primary-900 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-primary-200 text-sm">You Sent</p>
            <p className="text-4xl font-bold">${txn.sendAmount.toLocaleString()} <span className="text-2xl">{txn.sendCurrency}</span></p>
          </div>
          <div className="text-right">
            <p className="text-primary-200 text-sm">They Received</p>
            <p className="text-2xl font-bold">{txn.receiveAmount?.toLocaleString()} {txn.receiveCurrency}</p>
          </div>
        </div>
        <div className="flex items-center gap-3 text-sm text-primary-200">
          <span>Rate: 1 {txn.sendCurrency} = {txn.exchangeRate} {txn.receiveCurrency}</span>
          <span>·</span>
          <span>Fee: ${txn.transferFee}</span>
        </div>
      </div>

      {/* Progress tracker */}
      {!['failed', 'cancelled'].includes(txn.status) && (
        <div className="card">
          <h3 className="font-bold text-gray-900 mb-5">Transfer Status</h3>
          <div className="relative">
            <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-200" />
            <div className="absolute top-4 left-4 h-0.5 bg-primary-600 transition-all" style={{ width: `${Math.max(0, currentStepIdx) * 33.3}%` }} />
            <div className="relative flex justify-between">
              {STATUS_STEPS.map((s, i) => (
                <div key={s} className="flex flex-col items-center">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center z-10 border-2 ${i < currentStepIdx ? 'bg-green-500 border-green-500 text-white' : i === currentStepIdx ? 'bg-primary-600 border-primary-600 text-white' : 'bg-white border-gray-200 text-gray-300'}`}>
                    {i < currentStepIdx ? <Check size={16} /> : i === currentStepIdx ? <Clock size={16} /> : <span className="text-xs">{i+1}</span>}
                  </div>
                  <p className="text-xs mt-2 font-medium capitalize text-gray-500">{s}</p>
                </div>
              ))}
            </div>
          </div>
          {txn.estimatedDelivery && (
            <p className="text-sm text-gray-500 mt-4 text-center">
              Estimated delivery: {new Date(txn.estimatedDelivery).toLocaleDateString()} {new Date(txn.estimatedDelivery).toLocaleTimeString()}
            </p>
          )}
        </div>
      )}

      {/* Failed / Cancelled */}
      {['failed', 'cancelled'].includes(txn.status) && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center gap-3">
          <X className="w-6 h-6 text-red-500 flex-shrink-0" />
          <div>
            <p className="font-semibold text-red-800 capitalize">{txn.status}</p>
            <p className="text-sm text-red-600">{txn.flaggedReason || 'This transaction has been ' + txn.status}</p>
          </div>
        </div>
      )}

      {/* Flagged */}
      {txn.isFlagged && (
        <div className="bg-orange-50 border border-orange-100 rounded-xl p-4 flex items-center gap-3">
          <AlertCircle className="w-6 h-6 text-orange-500 flex-shrink-0" />
          <div>
            <p className="font-semibold text-orange-800">Under Review</p>
            <p className="text-sm text-orange-600">This transaction requires additional verification</p>
          </div>
        </div>
      )}

      {/* Details */}
      <div className="card space-y-4">
        <h3 className="font-bold text-gray-900">Recipient Details</h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div><p className="text-gray-400 text-xs mb-0.5">Name</p><p className="font-semibold text-gray-800">{txn.beneficiary?.firstName} {txn.beneficiary?.lastName}</p></div>
          <div><p className="text-gray-400 text-xs mb-0.5">Country</p><p className="font-semibold text-gray-800">{txn.receiveCountry}</p></div>
          <div><p className="text-gray-400 text-xs mb-0.5">Payout Method</p><p className="font-semibold text-gray-800 capitalize">{txn.payoutMethod?.replace('_', ' ')}</p></div>
          <div><p className="text-gray-400 text-xs mb-0.5">Payment Method</p><p className="font-semibold text-gray-800 capitalize">{txn.paymentMethod?.replace('_', ' ')}</p></div>
        </div>
      </div>

      {/* History */}
      <div className="card">
        <h3 className="font-bold text-gray-900 mb-4">Status History</h3>
        <div className="space-y-3">
          {[...txn.statusHistory].reverse().map((h, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className="w-2 h-2 bg-primary-400 rounded-full mt-1.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-gray-800 capitalize">{h.status}</p>
                {h.note && <p className="text-xs text-gray-500">{h.note}</p>}
                <p className="text-xs text-gray-400">{new Date(h.timestamp).toLocaleString()}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cancel button */}
      {txn.status === 'pending' && (
        <button onClick={handleCancel} className="btn-danger w-full flex items-center justify-center gap-2">
          <X size={16} /> Cancel Transfer
        </button>
      )}
    </div>
  );
}
