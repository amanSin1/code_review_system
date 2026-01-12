import React, { useState, useEffect } from 'react';
import { Code2, MessageSquare, CheckCircle2, Clock } from 'lucide-react';
import { fetchSubmissionsAPI } from '../../services/api';

export default function SubmissionsView({ user, onViewChange, onSelectSubmission }) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSubmissions();
  }, []);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const res = await fetchSubmissionsAPI();
      setSubmissions(res.submissions || []);
    } catch (err) {
      console.error('Failed to load submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">Code Submissions</h1>
          <p className="text-slate-600">Review and collaborate on code</p>
        </div>
        {user.role === 'student' && (
          <button
            onClick={() => onViewChange('create')}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
          >
            <span className="text-xl">+</span>
            <span>New Submission</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
        </div>
      ) : submissions.length === 0 ? (
        <div className="text-center py-12">
          <Code2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <p className="text-slate-500">No submissions yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {submissions.map((submission, idx) => (
            <div
              key={submission.id}
              className="group bg-white rounded-2xl p-6 shadow-sm hover:shadow-xl transition-all duration-300 border border-slate-200 hover:border-purple-300 cursor-pointer animate-slide-up"
              style={{ animationDelay: `${idx * 100}ms` }}
              onClick={() => onSelectSubmission(submission.id)}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900 mb-2 group-hover:text-purple-600 transition-colors">
                    {submission.title}
                  </h3>
                  <p className="text-sm text-slate-600 line-clamp-2">{submission.description}</p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-medium ml-2 ${
                  submission.status === 'reviewed' 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-amber-100 text-amber-700'
                }`}>
                  {submission.status === 'reviewed' ? (
                    <div className="flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Reviewed</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-1">
                      <Clock className="w-3 h-3" />
                      <span>Pending</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-2 mb-4">
                {(submission.tags || []).slice(0, 3).map((tag, i) => (
                  <span key={i} className="px-2 py-1 bg-purple-50 text-purple-700 rounded-lg text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                <div className="flex items-center space-x-4 text-sm text-slate-500">
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>{submission.review_count || 0}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Code2 className="w-4 h-4" />
                    <span className="capitalize">{submission.language}</span>
                  </div>
                </div>
                <div className="text-xs text-slate-400">
                  {submission.created_at ? new Date(submission.created_at).toLocaleDateString() : ''}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}