import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coins } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const PRIMARY_API_BASE = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:8000/api/v1';

  const performLogin = async (loginEmail, loginPassword) => {
    setLoading(true);
    setError('');
    
    try {
      const params = new URLSearchParams();
      params.append('username', loginEmail);
      params.append('password', loginPassword);

      const response = await fetch(`${PRIMARY_API_BASE}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || 'Login failed');
      }

      const data = await response.json();
      
      localStorage.setItem('vasooli_mode', 'authenticated');
      localStorage.setItem('vasooli_user', loginEmail);
      localStorage.setItem('vasooli_token', data.access_token);
      
      navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Failed to connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e) => {
    e.preventDefault();
    performLogin(email, password);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A5C3A] to-[#1A2E1A] flex items-center justify-center p-4 w-full">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
        <div className="text-center mb-8">
          {/* Vasooli Tracker Logo Badge */}
          <div 
            onClick={() => navigate('/')}
            className="inline-flex items-center justify-center gap-3 mb-3 cursor-pointer group"
          >
            <div className="w-14 h-14 bg-gradient-to-br from-[#0A5C3A] to-[#0A4A2E] rounded-2xl flex items-center justify-center shadow-xl shadow-[#0A5C3A]/30 group-hover:scale-105 transition-transform border border-white/20">
              <Coins className="w-7 h-7 text-white" />
            </div>
          </div>

          <h2 className="text-2xl font-extrabold text-[#1A1A2E] dark:text-white tracking-tight">
            Vasooli <span className="text-[#0A5C3A]">Tracker</span>
          </h2>
          <p className="text-xs font-bold text-[#0A5C3A] tracking-wider mt-0.5">
            देखो क्या बदला. समझो क्यों.
          </p>
          <p className="text-xs text-[#6B7280] dark:text-gray-400 mt-2 font-medium">
            Sign in to access your real-time market watchlist
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-600 dark:text-red-400 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] dark:text-white mb-1">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-[#1A1A2E] dark:text-white focus:outline-none focus:border-[#0A5C3A]"
              placeholder="your@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1A1A2E] dark:text-white mb-1">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-900 text-[#1A1A2E] dark:text-white focus:outline-none focus:border-[#0A5C3A]"
              placeholder="••••••••"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-[#0A5C3A] text-white rounded-xl font-semibold hover:bg-[#0A4A2E] transition disabled:opacity-50 shadow-lg shadow-[#0A5C3A]/25 cursor-pointer"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <div className="text-center mt-6">
          <button
            onClick={() => navigate('/')}
            className="text-sm text-[#0A5C3A] hover:underline font-medium cursor-pointer"
          >
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;

