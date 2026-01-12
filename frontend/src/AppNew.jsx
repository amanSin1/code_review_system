import React, { useState, useEffect } from 'react';
import { Code2 } from 'lucide-react';
import { getUser, clearAuth } from './utils/auth';
import { fetchNotificationsAPI } from './services/api';
import LoginView from './components/auth/LoginView';

import RegisterView from './components/auth/RegisterView';
import SubmissionsView from './components/submissions/SubmissionsView';
import CreateSubmissionView from './components/submissions/CreateSubmissionView';
import SubmissionDetailView from './components/submissions/SubmissionDetailView';
import NotificationsView from './components/notifications/NotificationsView';
import Navbar from './components/layout/Navbar';

function App() {
  const initialUser = getUser();
  const [currentView, setCurrentView] = useState(initialUser ? 'submissions' : 'login');
  const [user, setUser] = useState(initialUser);
  const [notifications, setNotifications] = useState([]);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);

  useEffect(() => {
    const onAuth = () => setUser(getUser());
    window.addEventListener('auth-changed', onAuth);
    return () => window.removeEventListener('auth-changed', onAuth);
  }, []);

  useEffect(() => {
    if (user) {
      loadNotifications();
    }
  }, [user]);

  const loadNotifications = async () => {
    try {
      const res = await fetchNotificationsAPI();
      const list = Array.isArray(res) ? res : (res.notifications || []);
      
      const readIds = JSON.parse(localStorage.getItem('readNotifications') || '[]');
      
      const notificationsWithReadStatus = list.map(notif => ({
        ...notif,
        read: readIds.includes(notif.id) || notif.read
      }));
      
      setNotifications(notificationsWithReadStatus);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const handleLogin = (loggedInUser) => {
    setUser(loggedInUser);
    setCurrentView('submissions');
  };

  const handleLogout = () => {
    clearAuth();
    setUser(null);
    setCurrentView('login');
  };

  const handleSelectSubmission = (id) => {
    setSelectedSubmissionId(id);
    setCurrentView('detail');
  };

  const handleSubmissionCreated = () => {
    setCurrentView('submissions');
  };

  const handleSubmissionUpdated = async () => {
    // Reload handled by components
  };

  const handleNotificationClick = () => {
    setCurrentView('notifications');
    
    const allIds = notifications.map(n => n.id);
    const existingReadIds = JSON.parse(localStorage.getItem('readNotifications') || '[]');
    const updatedReadIds = [...new Set([...existingReadIds, ...allIds])];
    localStorage.setItem('readNotifications', JSON.stringify(updatedReadIds));
    
    setNotifications(prevNotifs => 
      prevNotifs.map(notif => ({ ...notif, read: true }))
    );
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDE2YzAtMi4yMS0xLjc5LTQtNC00cy00IDEuNzktNCA0IDEuNzkgNCA0IDQgNC0xLjc5IDQtNHptMCAwIi8+PC9nPjwvZz48L3N2Zz4=')] opacity-40"></div>
        
        <div className="w-full max-w-md relative">
          <div className="text-center mb-8 animate-fade-in">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl mb-4 shadow-2xl">
              <Code2 className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">CodeReview</h1>
            <p className="text-purple-200">Elevate your code quality</p>
          </div>

          {currentView === 'login' ? (
            <LoginView onViewChange={setCurrentView} onLogin={handleLogin} />
          ) : (
            <RegisterView onViewChange={setCurrentView} />
          )}
        </div>

        <style>{`
          @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
          }
          
          @keyframes slide-up {
            from { 
              opacity: 0;
              transform: translateY(20px);
            }
            to { 
              opacity: 1;
              transform: translateY(0);
            }
          }
          
          .animate-fade-in {
            animation: fade-in 0.5s ease-out;
          }
          
          .animate-slide-up {
            animation: slide-up 0.6s ease-out backwards;
          }
          
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <Navbar
        user={user}
        currentView={currentView}
        unreadCount={unreadCount}
        onViewChange={setCurrentView}
        onNotificationClick={handleNotificationClick}
        onLogout={handleLogout}
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentView === 'submissions' && (
          <SubmissionsView 
            user={user} 
            onViewChange={setCurrentView} 
            onSelectSubmission={handleSelectSubmission}
          />
        )}

        {currentView === 'create' && (
          <CreateSubmissionView 
            onViewChange={setCurrentView}
            onSubmissionCreated={handleSubmissionCreated}
          />
        )}

        {currentView === 'detail' && selectedSubmissionId && (
          <SubmissionDetailView
            submissionId={selectedSubmissionId}
            user={user}
            onViewChange={setCurrentView}
            onSubmissionUpdated={handleSubmissionUpdated}
          />
        )}

        {currentView === 'notifications' && (
          <NotificationsView notifications={notifications} />
        )}
      </div>

      <style>{`
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        
        @keyframes slide-up {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fade-in {
          animation: fade-in 0.5s ease-out;
        }
        
        .animate-slide-up {
          animation: slide-up 0.6s ease-out backwards;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
}

export default App;