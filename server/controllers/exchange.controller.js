// @desc    Get exchange rates
export const getExchangeRates = async (req, res) => {
  try {
    const { from = 'USD', to } = req.query;
    
    // Mock rates - in production, integrate with exchangerate.host or openexchangerates.org
    const mockRates = {
      USD: {
        PKR: 278.50, INR: 83.20, BDT: 110.50, NPR: 133.00, PHP: 56.80,
        EUR: 0.92, GBP: 0.79, AED: 3.67, SAR: 3.75, CAD: 1.36,
        AUD: 1.53, MYR: 4.72, IDR: 15650, VND: 24500, THB: 35.20,
        MXN: 17.15, BRL: 4.97, KES: 152.00, GHS: 12.50, NGN: 1550.00,
        EGP: 30.90, MAD: 10.10, TZS: 2520.00, ZAR: 18.65, JOD: 0.71,
        QAR: 3.64, KWD: 0.31, BHD: 0.38, OMR: 0.38, LKR: 327.00,
        MMK: 2100.00, KHR: 4100.00, PGK: 3.74, FJD: 2.27, XOF: 603.00
      }
    };
    
    const rates = mockRates[from] || mockRates.USD;
    
    if (to) {
      const rate = rates[to];
      if (!rate) return res.status(404).json({ success: false, message: 'Currency pair not supported' });
      return res.json({ success: true, from, to, rate, timestamp: new Date() });
    }
    
    res.json({ success: true, base: from, rates, timestamp: new Date() });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get supported countries & currencies
export const getSupportedCountries = async (req, res) => {
  try {
    const countries = [
      { code: 'PK', name: 'Pakistan', currency: 'PKR', flag: '🇵🇰', payoutMethods: ['bank_deposit', 'cash_pickup', 'mobile_wallet'] },
      { code: 'IN', name: 'India', currency: 'INR', flag: '🇮🇳', payoutMethods: ['bank_deposit', 'mobile_wallet'] },
      { code: 'BD', name: 'Bangladesh', currency: 'BDT', flag: '🇧🇩', payoutMethods: ['bank_deposit', 'mobile_wallet'] },
      { code: 'NP', name: 'Nepal', currency: 'NPR', flag: '🇳🇵', payoutMethods: ['bank_deposit', 'cash_pickup'] },
      { code: 'PH', name: 'Philippines', currency: 'PHP', flag: '🇵🇭', payoutMethods: ['bank_deposit', 'cash_pickup', 'mobile_wallet'] },
      { code: 'AE', name: 'UAE', currency: 'AED', flag: '🇦🇪', payoutMethods: ['bank_deposit'] },
      { code: 'SA', name: 'Saudi Arabia', currency: 'SAR', flag: '🇸🇦', payoutMethods: ['bank_deposit'] },
      { code: 'MY', name: 'Malaysia', currency: 'MYR', flag: '🇲🇾', payoutMethods: ['bank_deposit', 'mobile_wallet'] },
      { code: 'ID', name: 'Indonesia', currency: 'IDR', flag: '🇮🇩', payoutMethods: ['bank_deposit', 'mobile_wallet'] },
      { code: 'VN', name: 'Vietnam', currency: 'VND', flag: '🇻🇳', payoutMethods: ['bank_deposit', 'cash_pickup'] },
      { code: 'MX', name: 'Mexico', currency: 'MXN', flag: '🇲🇽', payoutMethods: ['bank_deposit', 'cash_pickup'] },
      { code: 'KE', name: 'Kenya', currency: 'KES', flag: '🇰🇪', payoutMethods: ['bank_deposit', 'mobile_wallet'] },
      { code: 'GH', name: 'Ghana', currency: 'GHS', flag: '🇬🇭', payoutMethods: ['bank_deposit', 'mobile_wallet'] },
      { code: 'NG', name: 'Nigeria', currency: 'NGN', flag: '🇳🇬', payoutMethods: ['bank_deposit'] },
      { code: 'EG', name: 'Egypt', currency: 'EGP', flag: '🇪🇬', payoutMethods: ['bank_deposit', 'cash_pickup'] },
      { code: 'MA', name: 'Morocco', currency: 'MAD', flag: '🇲🇦', payoutMethods: ['bank_deposit', 'cash_pickup'] },
      { code: 'LK', name: 'Sri Lanka', currency: 'LKR', flag: '🇱🇰', payoutMethods: ['bank_deposit', 'cash_pickup'] },
      { code: 'TH', name: 'Thailand', currency: 'THB', flag: '🇹🇭', payoutMethods: ['bank_deposit', 'mobile_wallet'] },
      { code: 'QA', name: 'Qatar', currency: 'QAR', flag: '🇶🇦', payoutMethods: ['bank_deposit'] },
      { code: 'KW', name: 'Kuwait', currency: 'KWD', flag: '🇰🇼', payoutMethods: ['bank_deposit'] },
    ];
    
    res.json({ success: true, countries, total: countries.length });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
