import React, { useState, useEffect } from 'react';
import { Bell, Code2, LogOut, User, Plus, Star, MessageSquare, CheckCircle2, Clock } from 'lucide-react';

// API Configuration
const API_BASE = 'http://localhost:8000';

// Auth utilities using localStorage
function getToken() {
  return localStorage.getItem('token');
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('user') || 'null');
  } catch {
    return null;
  }
}

function saveToken(token) {
  localStorage.setItem('token', token);
}

function saveUser(user) {
  localStorage.setItem('user', JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  try {
    window.dispatchEvent(new Event('auth-changed'));
  } catch (e) {}
}

async function request(path, opts = {}) {
  const headers = opts.headers || {};
  const token = getToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (!headers['Content-Type'] && !(opts.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  const res = await fetch(API_BASE + path, { ...opts, headers });
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  if (!res.ok) {
    const message = (data && (data.detail || data.message)) || res.statusText || 'Request failed';
    if (res.status === 401) {
      clearAuth();
    }
    throw new Error(message);
  }
  return data;
}

// API Functions
async function loginAPI(email, password) {
  const res = await request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password })
  });
  if (res.access_token) {
    saveToken(res.access_token);
    if (res.user) saveUser(res.user);
    try {
      window.dispatchEvent(new Event('auth-changed'));
    } catch (e) {}
  }
  return res;
}

async function registerAPI(payload) {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

async function fetchSubmissionsAPI() {
  return request('/api/submissions');
}

async function fetchNotificationsAPI() {
  return request('/api/notifications');
}

async function fetchSubmissionAPI(id) {
  return request(`/api/submissions/${id}`);
}

async function createSubmissionAPI(payload) {
  return request('/api/submissions', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

async function createReviewAPI(payload) {
  return request('/api/reviews', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

async function updateSubmissionAPI(id, payload) {
  return request(`/api/submissions/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload)
  });
}

async function deleteSubmissionAPI(id) {
  return request(`/api/submissions/${id}`, {
    method: 'DELETE'
  });
}

// Login Component
function LoginView({ onViewChange, onLogin }) {
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

// Register Component
function RegisterView({ onViewChange }) {
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

// Submissions List Component
function SubmissionsView({ user, onViewChange, onSelectSubmission }) {
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
            <Plus className="w-5 h-5" />
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

// Create Submission Component
function CreateSubmissionView({ onViewChange, onSubmissionCreated }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    code_content: '',
    language: 'python',
    tags: ''
  });

  const handleSubmit = async () => {
    if (!formData.title || formData.title.length > 200) {
      alert('Title required (max 200 chars)');
      return;
    }
    if (!formData.description || formData.description.length > 2000) {
      alert('Description required (max 2000 chars)');
      return;
    }
    if (!formData.code_content) {
      alert('Code content required');
      return;
    }

    const payload = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    };

    try {
      await createSubmissionAPI(payload);
      setFormData({ title: '', description: '', code_content: '', language: 'python', tags: '' });
      onSubmissionCreated();
    } catch (err) {
      alert(err.message || 'Failed to create submission');
    }
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
        <h2 className="text-2xl font-bold text-slate-900 mb-6">Create New Submission</h2>
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              placeholder="e.g., React Authentication System"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
              rows={3}
              placeholder="Describe what you're building..."
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Language</label>
              <input
                type="text"
                list="languages"
                value={formData.language}
                onChange={(e) => setFormData({...formData, language: e.target.value})}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="e.g., python, javascript"
              />
              <datalist id="languages">
                <option value="python" />
                <option value="javascript" />
                <option value="typescript" />
                <option value="java" />
                <option value="cpp" />
                <option value="c" />
                <option value="csharp" />
                <option value="go" />
                <option value="rust" />
                <option value="ruby" />
                <option value="php" />
                <option value="swift" />
                <option value="kotlin" />
                <option value="scala" />
                <option value="r" />
                <option value="matlab" />
                <option value="sql" />
                <option value="html" />
                <option value="css" />
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Tags (comma-separated)</label>
              <input
                type="text"
                value={formData.tags}
                onChange={(e) => setFormData({...formData, tags: e.target.value})}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                placeholder="react, auth, security"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Code</label>
            <textarea
              value={formData.code_content}
              onChange={(e) => setFormData({...formData, code_content: e.target.value})}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-slate-50"
              rows={12}
              placeholder="Paste your code here..."
            />
          </div>
          <div className="flex space-x-4">
            <button
              onClick={handleSubmit}
              className="flex-1 py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              Submit for Review
            </button>
            <button
              onClick={() => onViewChange('submissions')}
              className="px-6 py-3 border border-slate-300 text-slate-700 rounded-xl font-semibold hover:bg-slate-50 transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// Submission Detail Component
function SubmissionDetailView({ submissionId, user, onViewChange, onSubmissionUpdated }) {
  const [submission, setSubmission] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    code_content: ''
  });
  const [reviewForm, setReviewForm] = useState({
    overall_comment: '',
    rating: 5,
    annotations: [{ comment_text: '', line_number: '' }]
  });

  useEffect(() => {
    loadSubmission();
  }, [submissionId]);

  const loadSubmission = async () => {
    try {
      const res = await fetchSubmissionAPI(submissionId);
      setSubmission(res);
      setEditForm({
        title: res.title,
        description: res.description,
        code_content: res.code_content
      });
    } catch (err) {
      alert('Failed to load submission details');
      onViewChange('submissions');
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this submission? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteSubmissionAPI(submissionId);
      alert('Submission deleted successfully!');
      onSubmissionUpdated();
      onViewChange('submissions');
    } catch (err) {
      alert(err.message || 'Failed to delete submission');
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditForm({
      title: submission.title,
      description: submission.description,
      code_content: submission.code_content
    });
  };

  const handleSaveEdit = async () => {
    if (!editForm.title || editForm.title.length > 200) {
      alert('Title required (max 200 chars)');
      return;
    }
    if (!editForm.description || editForm.description.length > 2000) {
      alert('Description required (max 2000 chars)');
      return;
    }
    if (!editForm.code_content) {
      alert('Code content required');
      return;
    }

    try {
      await updateSubmissionAPI(submissionId, editForm);
      await loadSubmission();
      setIsEditing(false);
      alert('Submission updated successfully!');
      onSubmissionUpdated();
    } catch (err) {
      alert(err.message || 'Failed to update submission');
    }
  };

  const handleSubmitReview = async () => {
    if (!reviewForm.overall_comment) {
      alert('Overall comment is required');
      return;
    }

    const anns = [];
    for (const ann of reviewForm.annotations) {
      const text = String(ann.comment_text || '').trim();
      if (text.length === 0) continue;
      let ln = 0;
      if (String(ann.line_number).trim() !== '') {
        ln = parseInt(ann.line_number, 10);
        if (Number.isNaN(ln)) {
          alert('Line number must be a number');
          return;
        }
      }
      anns.push({ comment_text: text, line_number: ln });
    }

    const payload = {
      submission_id: submission.id,
      overall_comment: reviewForm.overall_comment,
      rating: reviewForm.rating,
      annotations: anns
    };

    try {
      await createReviewAPI(payload);
      setReviewForm({ overall_comment: '', rating: 5, annotations: [{ comment_text: '', line_number: '' }] });
      await loadSubmission();
      alert('Review submitted successfully!');
    } catch (err) {
      alert(err.message || 'Failed to submit review');
    }
  };

  const addAnnotation = () => {
    setReviewForm(prev => ({
      ...prev,
      annotations: [...prev.annotations, { comment_text: '', line_number: '' }]
    }));
  };

  const removeAnnotation = (idx) => {
    setReviewForm(prev => ({
      ...prev,
      annotations: prev.annotations.filter((_, i) => i !== idx)
    }));
  };

  const updateAnnotation = (idx, field, value) => {
    setReviewForm(prev => ({
      ...prev,
      annotations: prev.annotations.map((ann, i) => 
        i === idx ? { ...ann, [field]: value } : ann
      )
    }));
  };

  if (!submission) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <button
        onClick={() => onViewChange('submissions')}
        className="mb-6 text-purple-600 hover:text-purple-700 font-medium flex items-center space-x-2"
      >
        <span>←</span>
        <span>Back to submissions</span>
      </button>

      <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 mb-6">
        <div className="flex justify-between items-start mb-6">
          <div className="flex-1">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Title</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    placeholder="e.g., React Authentication System"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description</label>
                  <textarea
                    value={editForm.description}
                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                    className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                    rows={3}
                    placeholder="Describe what you're building..."
                  />
                </div>
              </div>
            ) : (
              <>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">{submission.title}</h1>
                <p className="text-slate-600 mb-4">{submission.description}</p>
                <div className="flex items-center space-x-4 text-sm text-slate-500">
                  <span className="capitalize">{submission.language}</span>
                  <span>•</span>
                  <span>{submission.created_at ? new Date(submission.created_at).toLocaleDateString() : ''}</span>
                  {submission.author && (
                    <>
                      <span>•</span>
                      <span>by {submission.author.name}</span>
                    </>
                  )}
                </div>
                {submission.tags && submission.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {submission.tags.map((tag, i) => (
                      <span key={i} className="px-3 py-1 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
          <div className="flex items-center space-x-2 ml-4">
            {!isEditing && (
              <div className={`px-4 py-2 rounded-xl text-sm font-medium ${
                submission.status === 'reviewed' 
                  ? 'bg-green-100 text-green-700' 
                  : 'bg-amber-100 text-amber-700'
              }`}>
                {submission.status}
              </div>
            )}
            {user.id === submission.user?.id && submission.status === 'pending' && !isEditing && (
              <>
                <button
                  onClick={handleEdit}
                  className="px-4 py-2 bg-blue-100 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-200 transition-colors"
                >
                  Edit
                </button>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-100 text-red-700 rounded-xl text-sm font-medium hover:bg-red-200 transition-colors"
                >
                  Delete
                </button>
              </>
            )}
            {isEditing && (
              <>
                <button
                  onClick={handleSaveEdit}
                  className="px-4 py-2 bg-green-100 text-green-700 rounded-xl text-sm font-medium hover:bg-green-200 transition-colors"
                >
                  Save
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-medium hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {isEditing ? (
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Code</label>
            <textarea
              value={editForm.code_content}
              onChange={(e) => setEditForm({...editForm, code_content: e.target.value})}
              className="w-full px-4 py-3 border border-slate-300 rounded-xl font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-slate-50"
              rows={12}
              placeholder="Paste your code here..."
            />
          </div>
        ) : (
          <div className="bg-slate-900 rounded-xl p-6 overflow-auto">
            <pre className="text-slate-100 text-sm font-mono whitespace-pre-wrap">
              {submission.code_content}
            </pre>
          </div>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">
          Reviews ({submission.reviews ? submission.reviews.length : 0})
        </h2>
        {!submission.reviews || submission.reviews.length === 0 ? (
          <div className="bg-white rounded-2xl p-8 text-center text-slate-500 border border-slate-200">
            <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p>No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submission.reviews.map(review => (
              <div key={review.id} className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{review.reviewer?.name || 'Anonymous'}</p>
                      <p className="text-xs text-slate-500">
                        {review.created_at ? new Date(review.created_at).toLocaleString() : ''}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-xl font-semibold">
                    <Star className="w-4 h-4 fill-current" />
                    <span>{review.rating}/10</span>
                  </div>
                </div>
                
                <p className="text-slate-700 mb-4">{review.overall_comment}</p>
                
                {review.annotations && review.annotations.length > 0 && (
                  <div className="space-y-2 border-t border-slate-200 pt-4">
                    <p className="text-sm font-medium text-slate-700 mb-2">Line-by-line comments:</p>
                    {review.annotations.map((ann, idx) => (
                      <div key={idx} className="bg-slate-50 rounded-lg p-3">
                        <div className="flex items-start space-x-2">
                          <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-mono">
                            Line {ann.line_number}
                          </span>
                          <p className="text-sm text-slate-700 flex-1">{ann.comment_text}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {user.role === 'mentor' && (
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-6">Add Your Review</h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Overall Comment</label>
              <textarea
                value={reviewForm.overall_comment}
                onChange={(e) => setReviewForm({...reviewForm, overall_comment: e.target.value})}
                className="w-full px-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                rows={4}
                placeholder="Share your feedback..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">Rating (1-10)</label>
              <div className="flex items-center space-x-4">
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={reviewForm.rating}
                  onChange={(e) => setReviewForm({...reviewForm, rating: Number(e.target.value)})}
                  className="flex-1"
                />
                <div className="flex items-center space-x-2 px-4 py-2 bg-purple-100 text-purple-700 rounded-xl font-semibold">
                  <Star className="w-5 h-5 fill-current" />
                  <span>{reviewForm.rating}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Line-by-line Comments (Optional)
              </label>
              <div className="space-y-3">
                {reviewForm.annotations.map((ann, idx) => (
                  <div key={idx} className="p-4 border border-slate-300 rounded-xl bg-slate-50">
                    <div className="grid grid-cols-4 gap-3 mb-3">
                      <div className="col-span-1">
                        <label className="block text-xs font-medium text-slate-600 mb-1">Line #</label>
                        <input
                          type="text"
                          value={ann.line_number}
                          onChange={(e) => updateAnnotation(idx, 'line_number', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                          placeholder="0"
                        />
                      </div>
                      <div className="col-span-3">
                        <label className="block text-xs font-medium text-slate-600 mb-1">Comment</label>
                        <input
                          type="text"
                          value={ann.comment_text}
                          onChange={(e) => updateAnnotation(idx, 'comment_text', e.target.value)}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                          placeholder="Your comment on this line..."
                        />
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => removeAnnotation(idx)}
                        className="text-sm text-red-600 hover:text-red-700 font-medium"
                      >
                        Remove
                      </button>
                      {idx === reviewForm.annotations.length - 1 && (
                        <button
                          onClick={addAnnotation}
                          className="text-sm text-purple-600 hover:text-purple-700 font-medium"
                        >
                          + Add another
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={handleSubmitReview}
              className="w-full py-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
            >
              Submit Review
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Notifications Component
function NotificationsView({ notifications }) {
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

// Main App Component
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
      
      // Get read notification IDs from localStorage
      const readIds = JSON.parse(localStorage.getItem('readNotifications') || '[]');
      
      // Mark notifications as read if they're in the readIds array
      const notificationsWithReadStatus = list.map(notif => ({
        ...notif,
        read: readIds.includes(notif.id) || notif.read
      }));
      
      setNotifications(notificationsWithReadStatus);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    }
  };

  const markNotificationAsRead = (notificationId) => {
    setNotifications(prevNotifs => 
      prevNotifs.map(notif => 
        notif.id === notificationId ? { ...notif, read: true } : notif
      )
    );
  };

  const handleNotificationClick = () => {
    setCurrentView('notifications');
    
    // Mark all as read when opening notifications
    const allIds = notifications.map(n => n.id);
    const existingReadIds = JSON.parse(localStorage.getItem('readNotifications') || '[]');
    const updatedReadIds = [...new Set([...existingReadIds, ...allIds])];
    localStorage.setItem('readNotifications', JSON.stringify(updatedReadIds));
    
    setNotifications(prevNotifs => 
      prevNotifs.map(notif => ({ ...notif, read: true }))
    );
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
    // Reload submissions list
    if (currentView === 'submissions') {
      // Will trigger reload via useEffect
    }
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
      <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2 cursor-pointer" onClick={() => setCurrentView('submissions')}>
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                  <Code2 className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  CodeReview
                </span>
              </div>
              <button
                onClick={() => setCurrentView('submissions')}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  currentView === 'submissions' || currentView === 'detail' || currentView === 'create' ? 'bg-purple-100 text-purple-700' : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                Submissions
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleNotificationClick}
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
                  onClick={handleLogout}
                  className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </nav>

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