import React from 'react';
import { useNavigate } from 'react-router-dom';

const Landing = () => {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A5C3A] to-[#1A2E1A] flex items-center justify-center p-4 w-full">
      <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-[#0A5C3A] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#0A5C3A]/25">
            <span className="text-white text-4xl font-extrabold">V</span>
          </div>
          <h1 className="text-3xl font-bold text-[#1A1A2E] dark:text-white">Vasooli Tracker</h1>
          <p className="text-[#6B7280] dark:text-gray-400 mt-1 font-medium">Understand stocks, build wealth</p>
        </div>

        {/* Get Started Button */}
        <button
          onClick={handleGetStarted}
          className="w-full py-3 bg-[#0A5C3A] text-white rounded-xl font-semibold hover:bg-[#0A4A2E] transition text-lg shadow-lg shadow-[#0A5C3A]/25 cursor-pointer"
        >
          Get Started
        </button>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-[#6B7280] dark:text-gray-400">or</span>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-[#6B7280] dark:text-gray-400">Already have an account?</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-2 text-[#0A5C3A] hover:underline font-medium cursor-pointer"
          >
            Sign In
          </button>
        </div>
      </div>
    </div>
  );
};

export default Landing;

