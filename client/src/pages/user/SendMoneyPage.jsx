import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { exchangeAPI, beneficiaryAPI, transferAPI } from '../../utils/api';
import toast from 'react-hot-toast';
import { ChevronRight, ChevronLeft, Check, ArrowRight, Send, Globe, CreditCard, Building } from 'lucide-react';

const STEPS = ['Country & Amount', 'Select Recipient', 'Payment Method', 'Review & Send'];

const PAYOUT_METHODS = [
  { id: 'bank_deposit', label: 'Bank Deposit', icon: Building, desc: '1-2 business days' },
  { id: 'mobile_wallet', label: 'Mobile Wallet', icon: Globe, desc: '30 minutes' },
  { id: 'cash_pickup', label: 'Cash Pickup', icon: CreditCard, desc: '1-2 hours' },
];

const PAYMENT_METHODS = [
  { id: 'debit_card', label: 'Debit Card' },
  { id: 'credit_card', label: 'Credit Card' },
  { id: 'bank_transfer', label: 'Bank Transfer' },
];

export default function SendMoneyPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [countries, setCountries] = useState([]);
  const [beneficiaries, setBeneficiaries] = useState([]);
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    sendAmount: 100,
    sendCurrency: 'USD',
    receiveCountry: '',
    receiveCurrency: '',
    payoutMethod: 'bank_deposit',
    paymentMethod: 'debit_card',
    beneficiaryId: '',
    purpose: 'family_support',
    note: '',
  });

  useEffect(() => {
    exchangeAPI.getCountries().then(r => setCountries(r.data.countries));
    beneficiaryAPI.getAll().then(r => setBeneficiaries(r.data.beneficiaries));
  }, []);

  const fetchQuote = async () => {
    if (!form.sendAmount || !form.receiveCurrency) return;
    try {
      setLoading(true);
      const res = await transferAPI.getQuote({
        amount: form.sendAmount,
        fromCurrency: form.sendCurrency,
        toCurrency: form.receiveCurrency,
        payoutMethod: form.payoutMethod
      });
      setQuote(res.data.quote);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { if (form.receiveCurrency && step === 0) fetchQuote(); }, [form.sendAmount, form.receiveCurrency]);

  const handleSubmit = async () => {
    if (!form.beneficiaryId) return toast.error('Please select a recipient');
    if (!quote) return toast.error('Please get a quote first');
    setSubmitting(true);
    try {
      const res = await transferAPI.initiate({
        ...form,
        receiveAmount: quote.receiveAmount,
        exchangeRate: quote.exchangeRate,
        transferPurpose: form.purpose,
        senderNote: form.note,
      });
      toast.success('Transfer initiated successfully!');
      navigate(`/transactions/${res.data.transaction._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Transfer failed');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedBeneficiary = beneficiaries.find(b => b._id === form.beneficiaryId);
  const selectedCountry = countries.find(c => c.code === form.receiveCountry);

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Send Money</h1>
        <p className="text-gray-500 text-sm mt-1">Fast international transfers at great rates</p>
      </div>

      {/* Step indicator */}
      <div className="flex items-center mb-8">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center flex-1">
            <div className={`flex items-center gap-2 ${i <= step ? 'text-primary-700' : 'text-gray-400'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${i < step ? 'bg-green-500 text-white' : i === step ? 'bg-primary-600 text-white' : 'bg-gray-100 text-gray-400'}`}>
                {i < step ? <Check size={14} /> : i + 1}
              </div>
              <span className="hidden sm:block text-xs font-medium">{s}</span>
            </div>
            {i < STEPS.length - 1 && <div className={`flex-1 h-0.5 mx-2 ${i < step ? 'bg-green-500' : 'bg-gray-200'}`} />}
          </div>
        ))}
      </div>

      <div className="card">
        {/* Step 0: Country & Amount */}
        {step === 0 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-gray-900">You're sending</h2>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">You Send</label>
                <div className="flex">
                  <select className="input-field rounded-r-none border-r-0 w-24 bg-gray-50 font-medium" value={form.sendCurrency} onChange={e => setForm(f => ({...f, sendCurrency: e.target.value}))}>
                    <option>USD</option><option>GBP</option><option>EUR</option><option>CAD</option>
                  </select>
                  <input type="number" min="1" className="input-field rounded-l-none flex-1" value={form.sendAmount}
                    onChange={e => setForm(f => ({...f, sendAmount: parseFloat(e.target.value) || 0}))} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">They Receive (Country)</label>
                <select className="input-field" value={form.receiveCountry}
                  onChange={e => {
                    const c = countries.find(x => x.code === e.target.value);
                    setForm(f => ({...f, receiveCountry: e.target.value, receiveCurrency: c?.currency || ''}));
                  }}>
                  <option value="">Select country</option>
                  {countries.map(c => <option key={c.code} value={c.code}>{c.flag} {c.name}</option>)}
                </select>
              </div>
            </div>

            {/* Payout method */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Payout Method</label>
              <div className="grid grid-cols-3 gap-3">
                {PAYOUT_METHODS.filter(m => !selectedCountry || selectedCountry.payoutMethods?.includes(m.id)).map(({ id, label, icon: Icon, desc }) => (
                  <button key={id} type="button" onClick={() => setForm(f => ({...f, payoutMethod: id}))}
                    className={`p-3 rounded-xl border-2 text-left transition-all ${form.payoutMethod === id ? 'border-primary-500 bg-primary-50' : 'border-gray-100 hover:border-gray-200'}`}>
                    <Icon className={`w-5 h-5 mb-1.5 ${form.payoutMethod === id ? 'text-primary-600' : 'text-gray-500'}`} />
                    <p className="text-xs font-semibold text-gray-800">{label}</p>
                    <p className="text-xs text-gray-400">{desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Quote box */}
            {loading ? (
              <div className="bg-gray-50 rounded-xl p-4 text-center"><div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
            ) : quote ? (
              <div className="bg-gradient-to-r from-primary-50 to-blue-50 border border-primary-100 rounded-xl p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Exchange Rate</span>
                  <span className="font-bold text-gray-900">1 {form.sendCurrency} = {quote.exchangeRate} {form.receiveCurrency}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Transfer Fee</span>
                  <span className="font-medium text-gray-700">${quote.transferFee}</span>
                </div>
                <div className="flex items-center justify-between border-t border-primary-100 pt-2">
                  <span className="text-sm font-semibold text-gray-700">Recipient Gets</span>
                  <span className="text-xl font-bold text-primary-700">{quote.receiveAmount.toLocaleString()} {form.receiveCurrency}</span>
                </div>
                <p className="text-xs text-gray-500">⏱ Estimated delivery: {quote.estimatedDelivery}</p>
              </div>
            ) : null}

            <button onClick={() => { if (!form.receiveCountry) return toast.error('Select a country'); if (!quote) { fetchQuote(); return; } setStep(1); }} className="btn-primary w-full py-3 flex items-center justify-center gap-2">
              Continue <ChevronRight size={18} />
            </button>
          </div>
        )}

        {/* Step 1: Select recipient */}
        {step === 1 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-gray-900">Select Recipient</h2>
            
            {beneficiaries.filter(b => !form.receiveCountry || b.country === countries.find(c => c.code === form.receiveCountry)?.code || true).length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500 mb-4">No beneficiaries yet</p>
                <a href="/beneficiaries" className="btn-primary inline-block">Add Recipient</a>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto">
                {beneficiaries.map(b => (
                  <button key={b._id} type="button" onClick={() => setForm(f => ({...f, beneficiaryId: b._id}))}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${form.beneficiaryId === b._id ? 'border-primary-500 bg-primary-50' : 'border-gray-100 hover:border-gray-200'}`}>
                    <div className="w-11 h-11 bg-primary-100 rounded-full flex items-center justify-center text-primary-700 font-bold">
                      {b.firstName[0]}{b.lastName[0]}
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{b.firstName} {b.lastName}</p>
                      <p className="text-sm text-gray-500">{b.country} · {b.payoutMethod?.replace('_', ' ')} · {b.currency}</p>
                    </div>
                    {form.beneficiaryId === b._id && <Check className="w-5 h-5 text-primary-600 flex-shrink-0" />}
                  </button>
                ))}
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep(0)} className="btn-secondary flex items-center gap-2"><ChevronLeft size={18} /> Back</button>
              <button onClick={() => { if (!form.beneficiaryId) return toast.error('Select a recipient'); setStep(2); }} className="btn-primary flex-1 flex items-center justify-center gap-2">
                Continue <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Payment method */}
        {step === 2 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-gray-900">How do you want to pay?</h2>
            <div className="space-y-3">
              {PAYMENT_METHODS.map(({ id, label }) => (
                <button key={id} type="button" onClick={() => setForm(f => ({...f, paymentMethod: id}))}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all ${form.paymentMethod === id ? 'border-primary-500 bg-primary-50' : 'border-gray-100 hover:border-gray-200'}`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${form.paymentMethod === id ? 'border-primary-600' : 'border-gray-300'}`}>
                    {form.paymentMethod === id && <div className="w-2.5 h-2.5 bg-primary-600 rounded-full" />}
                  </div>
                  <CreditCard className="w-5 h-5 text-gray-500" />
                  <span className="font-medium text-gray-800">{label}</span>
                </button>
              ))}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Purpose of Transfer</label>
              <select className="input-field" value={form.purpose} onChange={e => setForm(f => ({...f, purpose: e.target.value}))}>
                <option value="family_support">Family Support</option>
                <option value="education">Education</option>
                <option value="medical">Medical</option>
                <option value="business">Business</option>
                <option value="gift">Gift</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Note (optional)</label>
              <input className="input-field" placeholder="Message to recipient..." value={form.note} onChange={e => setForm(f => ({...f, note: e.target.value}))} maxLength={200} />
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="btn-secondary flex items-center gap-2"><ChevronLeft size={18} /> Back</button>
              <button onClick={() => setStep(3)} className="btn-primary flex-1 flex items-center justify-center gap-2">
                Review Transfer <ChevronRight size={18} />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {step === 3 && (
          <div className="space-y-5">
            <h2 className="text-lg font-bold text-gray-900">Review Transfer</h2>
            
            <div className="bg-gray-50 rounded-xl p-5 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">You Send</span>
                <span className="font-bold">{form.sendAmount} {form.sendCurrency}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Transfer Fee</span>
                <span className="font-medium">${quote?.transferFee}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Deducted</span>
                <span className="font-bold">${quote?.totalDeducted}</span>
              </div>
              <div className="border-t border-gray-200 pt-3 flex justify-between">
                <span className="text-gray-700 font-semibold">Recipient Gets</span>
                <span className="text-2xl font-bold text-primary-700">{quote?.receiveAmount?.toLocaleString()} {form.receiveCurrency}</span>
              </div>
            </div>

            {selectedBeneficiary && (
              <div className="bg-blue-50 rounded-xl p-4">
                <p className="text-sm font-semibold text-gray-700 mb-1">Sending To</p>
                <p className="font-bold text-gray-900">{selectedBeneficiary.firstName} {selectedBeneficiary.lastName}</p>
                <p className="text-sm text-gray-500">{selectedBeneficiary.country} · {form.payoutMethod.replace('_', ' ')}</p>
              </div>
            )}

            <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-3 text-xs text-yellow-800">
              ⚠️ Please verify recipient details. Transactions cannot be reversed once processed.
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(2)} className="btn-secondary flex items-center gap-2"><ChevronLeft size={18} /> Back</button>
              <button onClick={handleSubmit} disabled={submitting} className="btn-primary flex-1 flex items-center justify-center gap-2 py-3">
                {submitting ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Processing...</> : <><Send size={18} /> Confirm & Send</>}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
