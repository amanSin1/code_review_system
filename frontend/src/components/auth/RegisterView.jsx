import React, { useState } from 'react';
import { registerAPI } from '../../services/api';

export default function RegisterView({ onViewChange }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'student'
  });
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setError('');
    try {
      await registerAPI(formData);
      onViewChange('login');
      setFormData({ name: '', email: '', password: '', role: 'student' });
    } catch (err) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 shadow-2xl border border-white/20 animate-slide-up">
      <h2 className="text-2xl font-bold text-white mb-6">Create account</h2>
      {error && (
        <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200 text-sm">
          {error}
        </div>
      )}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-purple-200 mb-2">Name</label>
          <input
            type="text"
            value={formData.name}
            onChange={(e) => setFormData({...formData, name: e.target.value})}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            placeholder="John Doe"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-purple-200 mb-2">Email</label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({...formData, email: e.target.value})}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            placeholder="you@example.com"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-purple-200 mb-2">Password</label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({...formData, password: e.target.value})}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-purple-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
            placeholder="••••••••"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-purple-200 mb-2">Role</label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({...formData, role: e.target.value})}
            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
          >
            <option value="student" className="bg-slate-800">Student</option>
            <option value="mentor" className="bg-slate-800">Mentor</option>
          </select>
        </div>
        <button
          onClick={handleRegister}
          className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
        >
          Create account
        </button>
      </div>
      <p className="text-center text-purple-200 text-sm mt-6">
        Already have an account?{' '}
        <button onClick={() => onViewChange('login')} className="text-purple-400 hover:text-purple-300 font-semibold">
          Sign in
        </button>
      </p>
    </div>
  );
}