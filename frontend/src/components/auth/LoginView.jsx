import React, { useState } from 'react';
import { loginAPI } from '../../services/api';
import { getUser } from '../../utils/auth';

export default function LoginView({ onViewChange, onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    try {
      await loginAPI(email, password);
      const loggedInUser = getUser();
      onLogin(loggedInUser);
      setEmail('');
      setPassword('');
    } catch (err) {
      setError(err.message || 'Login failed');
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 animate-slide-up">
      <h2 className="text-2xl font-bold text-white mb-6">Welcome back</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm">
          {error}
        </div>
      )}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-purple-200 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-purple-200 mb-2">Password</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            placeholder="••••••••"
          />
        </div>
        <button
          onClick={handleLogin}
          className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
        >
          Sign in
        </button>
      </div>
      <p className="text-center text-purple-200 text-sm mt-6">
        Don't have an account?{' '}
        <button onClick={() => onViewChange('register')} className="text-purple-400 hover:text-purple-300 font-semibold">
          Create one
        </button>
      </p>
    </div>
  );
}