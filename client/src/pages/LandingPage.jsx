import { Link } from 'react-router-dom';
import { Globe, Shield, Zap, ArrowRight, CheckCircle, Star, Send, Building2, Smartphone, TrendingUp } from 'lucide-react';

const COUNTRIES = ['🇵🇰 Pakistan', '🇮🇳 India', '🇧🇩 Bangladesh', '🇵🇭 Philippines', '🇳🇬 Nigeria', '🇰🇪 Kenya', '🇲🇽 Mexico', '🇲🇾 Malaysia'];

const FEATURES = [
  { icon: Zap, title: 'Lightning Fast', desc: 'Transfers in minutes to mobile wallets and cash pickup' },
  { icon: Shield, title: 'Bank-Grade Security', desc: 'AES-256 encryption & fraud monitoring 24/7' },
  { icon: Globe, title: '100+ Countries', desc: 'Bank deposits, cash pickup & digital wallets' },
  { icon: TrendingUp, title: 'Best Rates', desc: 'Real-time competitive FX rates with low fees' },
];

const STEPS = [
  { step: '01', title: 'Create Account', desc: 'Sign up free and complete quick KYC verification' },
  { step: '02', title: 'Enter Details', desc: 'Choose recipient country & enter amount' },
  { step: '03', title: 'Pay Securely', desc: 'Pay by card or bank transfer' },
  { step: '04', title: 'Money Delivered', desc: 'Your recipient gets the money fast!' },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white" style={{ fontFamily: 'DM Sans, sans-serif' }}>
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-gradient-to-br from-primary-600 to-primary-800 rounded-xl flex items-center justify-center shadow-lg shadow-primary-200">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-primary-800">TransFast</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-600">
            <a href="#features" className="hover:text-primary-700 transition-colors font-medium">Features</a>
            <a href="#how-it-works" className="hover:text-primary-700 transition-colors font-medium">How It Works</a>
            <a href="#rates" className="hover:text-primary-700 transition-colors font-medium">Rates</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login" className="text-sm font-semibold text-primary-700 hover:text-primary-900 transition-colors px-4 py-2">Sign In</Link>
            <Link to="/register" className="btn-primary text-sm py-2 px-5">Get Started</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-28 pb-20 relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary-50 via-white to-accent-50 -z-10" />
        <div className="absolute top-20 right-0 w-96 h-96 bg-primary-100 rounded-full blur-3xl opacity-40 -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-accent-100 rounded-full blur-3xl opacity-40 -z-10" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 bg-primary-50 border border-primary-100 rounded-full px-4 py-1.5 text-sm font-medium text-primary-700 mb-6">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Now serving 100+ countries worldwide
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 leading-tight mb-6 max-w-4xl mx-auto">
            Send Money{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-800">
              Globally
            </span>{' '}
            in Minutes
          </h1>
          
          <p className="text-xl text-gray-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Fast, secure, and affordable international money transfers. 
            Best exchange rates with bank-grade security.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-primary flex items-center gap-2 text-base py-3.5 px-8 shadow-lg shadow-primary-200">
              Start Sending Money <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/login" className="btn-secondary text-base py-3.5 px-8">
              Track Transfer
            </Link>
          </div>
          
          {/* Trust badges */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-12">
            {['Bank-level encryption', 'FCA Regulated', 'No hidden fees'].map(t => (
              <div key={t} className="flex items-center gap-2 text-sm text-gray-500">
                <CheckCircle className="w-4 h-4 text-green-500" />
                <span>{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 bg-primary-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { value: '100+', label: 'Countries' },
              { value: '$2B+', label: 'Transferred' },
              { value: '2M+', label: 'Customers' },
              { value: '99.9%', label: 'Uptime' },
            ].map(({ value, label }) => (
              <div key={label}>
                <div className="text-4xl font-bold text-white mb-1">{value}</div>
                <div className="text-primary-300 text-sm">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose TransFast?</h2>
            <p className="text-gray-500 text-lg">Everything you need for hassle-free international transfers</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card hover:shadow-md transition-all duration-200 hover:-translate-y-1">
                <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-primary-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-2">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section id="how-it-works" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">How It Works</h2>
            <p className="text-gray-500 text-lg">Send money in 4 simple steps</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {STEPS.map(({ step, title, desc }, i) => (
              <div key={step} className="relative">
                {i < STEPS.length - 1 && <div className="hidden lg:block absolute top-8 left-full w-full h-0.5 bg-gray-200 z-0" />}
                <div className="relative z-10">
                  <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mb-5 shadow-lg shadow-primary-200">
                    <span className="text-2xl font-bold text-white">{step}</span>
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 mb-2">{title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Countries */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Popular Corridors</h2>
          <p className="text-gray-500 mb-10">Send to any of our 100+ supported countries</p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            {COUNTRIES.map(c => (
              <span key={c} className="bg-gray-100 hover:bg-primary-50 hover:text-primary-700 text-gray-700 px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer">
                {c}
              </span>
            ))}
            <span className="bg-primary-600 text-white px-4 py-2 rounded-full text-sm font-medium">+92 more →</span>
          </div>
        </div>
      </section>

      {/* Payout methods */}
      <section className="py-16 bg-primary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Multiple Payout Options</h2>
          </div>
          <div className="grid sm:grid-cols-3 gap-6 max-w-3xl mx-auto">
            {[
              { icon: Building2, title: 'Bank Deposit', desc: 'Direct to any bank account worldwide' },
              { icon: Smartphone, title: 'Mobile Wallet', desc: 'Instant to mobile money accounts' },
              { icon: Send, title: 'Cash Pickup', desc: '500,000+ pickup locations globally' },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card text-center border-0 shadow-sm">
                <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-7 h-7 text-primary-600" />
                </div>
                <h3 className="font-bold text-gray-900 mb-1.5">{title}</h3>
                <p className="text-sm text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-primary-700 to-primary-900">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-4xl font-bold text-white mb-5">Ready to Send Money?</h2>
          <p className="text-primary-200 text-lg mb-10">Join millions who trust TransFast for international transfers</p>
          <Link to="/register" className="inline-flex items-center gap-2 bg-accent-500 hover:bg-accent-600 text-white font-bold py-4 px-10 rounded-xl text-lg transition-all shadow-xl">
            Create Free Account <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-primary-300 text-sm mt-6">No monthly fees · No hidden charges</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Globe className="w-6 h-6 text-primary-400" />
              <span className="text-white font-bold text-xl">TransFast</span>
            </div>
            <div className="flex gap-8 text-sm">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
            <p className="text-xs text-gray-600 w-full text-center mt-6">
              © 2024 TransFast. All rights reserved. Licensed and regulated.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
