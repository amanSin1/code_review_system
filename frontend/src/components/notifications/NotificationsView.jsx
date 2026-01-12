import React from 'react';
import { Bell } from 'lucide-react';

export default function NotificationsView({ notifications }) {
  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold text-slate-900 mb-8">Notifications</h1>
      {notifications.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-200">
          <Bell className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <p>No notifications yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {notifications.map((notif) => (
            <div
              key={notif.id}
              className={`p-6 rounded-2xl border transition-all ${
                notif.read 
                  ? 'bg-white border-slate-200' 
                  : 'bg-purple-50 border-purple-200'
              }`}
            >
              <p className="text-slate-900 mb-2">{notif.message}</p>
              <p className="text-sm text-slate-500">
                {notif.created_at ? new Date(notif.created_at).toLocaleString() : ''}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}