import { useState, useEffect } from 'react';
import { exchangeAPI } from '../../utils/api';
import { TrendingUp, RefreshCw } from 'lucide-react';

export default function RatesPage() {
  const [rates, setRates] = useState({});
  const [countries, setCountries] = useState([]);
  const [baseCurrency, setBaseCurrency] = useState('USD');
  const [amount, setAmount] = useState(100);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    try {
      const [ratesRes, countriesRes] = await Promise.all([
        exchangeAPI.getRates({ from: baseCurrency }),
        exchangeAPI.getCountries()
      ]);
      setRates(ratesRes.data.rates);
      setCountries(countriesRes.data.countries);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { load(); }, [baseCurrency]);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-gray-900">Exchange Rates</h1><p className="text-sm text-gray-500 mt-1">Live rates updated every 30 minutes</p></div>
        <button onClick={load} className="btn-secondary flex items-center gap-2 text-sm py-2"><RefreshCw size={14} /> Refresh</button>
      </div>

      {/* Calculator */}
      <div className="card bg-gradient-to-r from-primary-700 to-primary-900 border-0">
        <h3 className="text-white font-bold mb-4">Quick Calculator</h3>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex flex-1">
            <select className="bg-white/20 text-white border border-white/30 rounded-l-xl px-3 py-2.5 text-sm font-medium w-24" value={baseCurrency} onChange={e => setBaseCurrency(e.target.value)}>
              <option>USD</option><option>GBP</option><option>EUR</option><option>CAD</option>
            </select>
            <input type="number" min="1" className="flex-1 bg-white/10 border border-white/30 border-l-0 rounded-r-xl px-4 py-2.5 text-white placeholder-white/50 outline-none text-lg font-bold" value={amount} onChange={e => setAmount(parseFloat(e.target.value) || 0)} />
          </div>
          <div className="text-white/80 flex items-center text-sm sm:w-32 text-center">= Amount × Rate</div>
        </div>
      </div>

      {/* Rates table */}
      <div className="card overflow-hidden p-0">
        <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
          <TrendingUp size={18} className="text-primary-600" />
          <h3 className="font-bold text-gray-900">Rates from {baseCurrency}</h3>
        </div>
        {loading ? (
          <div className="p-6 space-y-3">{[1,2,3,4,5].map(i => <div key={i} className="h-12 bg-gray-50 rounded-xl animate-pulse" />)}</div>
        ) : (
          <div className="divide-y divide-gray-50">
            {countries.map(c => {
              const rate = rates[c.currency];
              if (!rate) return null;
              return (
                <div key={c.code} className="flex items-center justify-between px-6 py-3.5 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{c.flag}</span>
                    <div>
                      <p className="font-semibold text-gray-800 text-sm">{c.name}</p>
                      <p className="text-xs text-gray-400">{c.currency}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">{rate.toFixed(4)}</p>
                    <p className="text-xs text-green-600 font-medium">{amount > 0 ? (amount * rate).toFixed(2) : '-'} {c.currency}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
