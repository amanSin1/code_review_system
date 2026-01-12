import React from 'react';
import { Bell, Code2, LogOut, User } from 'lucide-react';

export default function Navbar({ user, currentView, unreadCount, onViewChange, onNotificationClick, onLogout }) {
  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <div className="flex items-center space-x-2 cursor-pointer" onClick={() => onViewChange('submissions')}>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                CodeReview
              </span>
            </div>
            <button
              onClick={() => onViewChange('submissions')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentView === 'submissions' || currentView === 'detail' || currentView === 'create' 
                  ? 'bg-purple-100 text-purple-700' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              Submissions
            </button>
          </div>
          <div className="flex items-center space-x-4">
            <button
              onClick={onNotificationClick}
              className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Bell className="w-5 h-5" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">{user.name}</p>
                <p className="text-xs text-slate-500 capitalize">{user.role}</p>
              </div>
              <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}