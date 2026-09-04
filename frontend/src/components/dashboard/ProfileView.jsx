import React, { useState, useEffect } from 'react';
import { fetchUserProfile, updateUserProfile } from '../../services/api';

export default function ProfileView() {
  const [profile, setProfile] = useState({
    full_name: 'Ashmisikha Piri',
    email: 'ashmisikha@email.com',
    phone: '+91 98765 43210',
    dob: '1998-05-15',
    gender: 'Female',
    risk_tolerance: 'Moderate',
    investment_goals: 'Wealth Accumulation, Long-term Growth',
    experience_level: 'Intermediate (2-5 years)',
    preferred_sectors: 'Technology, Financials, Healthcare',
    investment_horizon: '3-5 Years',
    investment_style: 'Growth & Value',
    preferred_markets: 'India, US',
    asset_classes: 'Equities, ETFs, Mutual Funds',
    watchlist_view: 'Grid',
    notification_preferences: 'Email, Push Notifications'
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    setIsLoading(true);
    try {
      const res = await fetchUserProfile();
      if (res.data || res.profile) {
        setProfile(prev => ({ ...prev, ...(res.data || res.profile) }));
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    try {
      const res = await updateUserProfile(profile);
      if (res.data || res.profile) {
        setProfile(prev => ({ ...prev, ...(res.data || res.profile) }));
      }
      setMessage({ type: 'success', text: 'Profile & Investor preferences updated successfully!' });
    } catch (err) {
      setMessage({ type: 'error', text: err.message || 'Failed to update profile.' });
    } finally {
      setIsSaving(false);
      setTimeout(() => setMessage(null), 4000);
    }
  };

  const handleReset = () => {
    loadProfile();
    setMessage({ type: 'info', text: 'Reverted to last saved settings.' });
    setTimeout(() => setMessage(null), 3000);
  };

  const firstName = profile.full_name ? profile.full_name.trim().split(' ')[0] : 'Ashmisikha';

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-5xl mx-auto animate-pulse">
        <div className="h-32 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
          <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      
      {/* Header Banner & Greeting */}
      <div className="flex items-center space-x-4 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-2xs">
        <div className="w-16 h-16 rounded-full bg-[#0A5C3A] flex items-center justify-center text-white text-2xl font-black shadow-md shadow-[#0A5C3A]/25">
          {firstName.slice(0, 1).toUpperCase()}
        </div>
        <div>
          <h2 className="text-xl font-extrabold text-[#1A1A2E] dark:text-white flex items-center gap-2">
            Investor Profile: {profile.full_name}
          </h2>
          <p className="text-[#6B7280] dark:text-gray-400 text-xs mt-0.5 font-medium">
            Customize risk tolerance, investment horizon, goals, and preferred sectors for automated stock profile fit scoring.
          </p>
        </div>
      </div>

      {/* Alert Message Banner */}
      {message && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between border ${
          message.type === 'error' 
            ? 'bg-[#F5E6E6] dark:bg-[#8B1A1A]/30 text-[#8B1A1A] dark:text-red-300 border-[#8B1A1A]/30' 
            : message.type === 'info'
            ? 'bg-gray-100 dark:bg-gray-700 text-[#8E8E93] dark:text-gray-300 border-gray-300 dark:border-gray-600'
            : 'bg-[#E8F5EE] dark:bg-[#0A4A2E]/40 text-[#0A5C3A] border-[#0A5C3A]/30'
        }`}>
          <span>{message.text}</span>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-6">
        
        {/* Section 1: Personal Information */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-2xs space-y-4">
          <h3 className="font-extrabold text-[#1A1A2E] dark:text-white text-base border-b border-gray-100 dark:border-gray-700 pb-3">
            Account Information
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
            <div>
              <label className="text-gray-500 dark:text-gray-400 font-bold block mb-1">Full Name</label>
              <input
                type="text"
                value={profile.full_name || ''}
                onChange={(e) => handleChange('full_name', e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-[#1A1A2E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A5C3A]"
                required
              />
            </div>

            <div>
              <label className="text-gray-500 dark:text-gray-400 font-bold block mb-1">Email Address</label>
              <input
                type="email"
                value={profile.email || ''}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-[#1A1A2E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A5C3A]"
                required
              />
            </div>

            <div>
              <label className="text-gray-500 dark:text-gray-400 font-bold block mb-1">Phone Number</label>
              <input
                type="text"
                value={profile.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-[#1A1A2E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A5C3A]"
              />
            </div>

            <div>
              <label className="text-gray-500 dark:text-gray-400 font-bold block mb-1">Date of Birth</label>
              <input
                type="date"
                value={profile.dob || ''}
                onChange={(e) => handleChange('dob', e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-[#1A1A2E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A5C3A]"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Investor Profile & Strategy */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 shadow-2xs space-y-4">
          <h3 className="font-extrabold text-[#1A1A2E] dark:text-white text-base border-b border-gray-100 dark:border-gray-700 pb-3">
            Investor Strategy & Risk Profile
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-medium">
            <div>
              <label className="text-gray-500 dark:text-gray-400 font-bold block mb-1">Risk Tolerance</label>
              <select
                value={profile.risk_tolerance || 'Moderate'}
                onChange={(e) => handleChange('risk_tolerance', e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-[#1A1A2E] dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#0A5C3A]"
              >
                <option value="Conservative">Conservative (Low Volatility)</option>
                <option value="Moderate">Moderate (Balanced)</option>
                <option value="Aggressive">Aggressive (High Growth)</option>
              </select>
            </div>

            <div>
              <label className="text-gray-500 dark:text-gray-400 font-bold block mb-1">Investment Horizon</label>
              <select
                value={profile.investment_horizon || '3-5 Years'}
                onChange={(e) => handleChange('investment_horizon', e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-[#1A1A2E] dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#0A5C3A]"
              >
                <option value="Short (<1 year)">Short (&lt;1 year)</option>
                <option value="Medium (1-3 years)">Medium (1-3 years)</option>
                <option value="3-5 Years">Long (3-5+ years)</option>
              </select>
            </div>

            <div>
              <label className="text-gray-500 dark:text-gray-400 font-bold block mb-1">Investment Style</label>
              <select
                value={profile.investment_style || 'Growth & Value'}
                onChange={(e) => handleChange('investment_style', e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-[#1A1A2E] dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#0A5C3A]"
              >
                <option value="Growth">Growth</option>
                <option value="Value">Value</option>
                <option value="Income">Income / Dividend</option>
                <option value="Growth & Value">Growth & Value (Blended)</option>
              </select>
            </div>

            <div>
              <label className="text-gray-500 dark:text-gray-400 font-bold block mb-1">Preferred Markets</label>
              <select
                value={profile.preferred_markets || 'India, US'}
                onChange={(e) => handleChange('preferred_markets', e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-[#1A1A2E] dark:text-white font-bold focus:outline-none focus:ring-2 focus:ring-[#0A5C3A]"
              >
                <option value="India">India (NSE / BSE)</option>
                <option value="US">United States (NYSE / NASDAQ)</option>
                <option value="India, US">India & US Equities</option>
                <option value="Global">Global Markets</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="text-gray-500 dark:text-gray-400 font-bold block mb-1">Preferred Sectors (Comma Separated)</label>
              <input
                type="text"
                value={profile.preferred_sectors || ''}
                onChange={(e) => handleChange('preferred_sectors', e.target.value)}
                className="w-full px-3.5 py-2 border border-gray-200 dark:border-gray-700 rounded-xl bg-gray-50 dark:bg-gray-900 text-[#1A1A2E] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#0A5C3A]"
                placeholder="e.g. Technology, Financials, Healthcare, Energy"
              />
            </div>
          </div>
        </div>

        {/* Save Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-[#0A5C3A] hover:bg-[#0A4A2E] text-white rounded-xl font-extrabold text-xs transition shadow-md shadow-[#0A5C3A]/25 flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            Save Profile & Preferences
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-2.5 border border-gray-200 dark:border-gray-700 rounded-xl font-bold text-xs text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer"
          >
            Reset
          </button>
        </div>

      </form>
    </div>
  );
}
