import React, { useState, useEffect } from 'react';
import { User, Star, MessageSquare, Video, Sparkles, X, AlertCircle, CheckCircle, Clock } from 'lucide-react'; // Added Sparkles, X, AlertCircle, CheckCircle, Clock
import { fetchSubmissionAPI, createReviewAPI, updateSubmissionAPI, deleteSubmissionAPI, analyzeCodeWithAI, getAIQuota } from '../../services/api'; // Added analyzeCodeWithAI, getAIQuota
// import React, { useState, useEffect } from 'react';
// import { User, Star, MessageSquare, Video } from 'lucide-react';
// import { fetchSubmissionAPI, createReviewAPI, updateSubmissionAPI, deleteSubmissionAPI } from '../../services/api';

export default function SubmissionDetailView({ submissionId, user, onViewChange, onSubmissionUpdated }) {
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

  // AI Analysis States
  const [showAIModal, setShowAIModal] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiQuota, setAiQuota] = useState(null);

  useEffect(() => {
    loadSubmission();
  }, [submissionId]);

  const loadSubmission = async () => {
    try {
      const res = await fetchSubmissionAPI(submissionId);
      console.log('📹 Submission data:', res); // DEBUG: Check if video_url exists
      console.log('📹 Video URL:', res.video_url || res.video_walkthrough_url); // Check both possible field names
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

  // AI Analysis Functions
const loadAIQuota = async () => {
  try {
    const quota = await getAIQuota();
    setAiQuota(quota);
  } catch (err) {
    console.error('Failed to load AI quota:', err);
  }
};

const handleAIAnalysis = async () => {
  setShowAIModal(true);
  setAiLoading(true);
  setAiAnalysis(null);

  try {
    const payload = {
      code: submission.code_content,
      language: submission.language,
      title: submission.title,
      description: submission.description
    };

    const result = await analyzeCodeWithAI(payload);
    setAiAnalysis(result);
    
    // Refresh quota
    await loadAIQuota();
  } catch (err) {
    setAiAnalysis({
      error: true,
      message: err.message || 'AI analysis failed. Please try again.'
    });
  } finally {
    setAiLoading(false);
  }
};

const closeAIModal = () => {
  setShowAIModal(false);
  setAiAnalysis(null);
};

const getSeverityColor = (severity) => {
  switch (severity) {
    case 'critical':
      return 'bg-red-100 text-red-700 border-red-300';
    case 'warning':
      return 'bg-amber-100 text-amber-700 border-amber-300';
    case 'suggestion':
      return 'bg-blue-100 text-blue-700 border-blue-300';
    default:
      return 'bg-slate-100 text-slate-700 border-slate-300';
  }
};

const getSeverityIcon = (severity) => {
  switch (severity) {
    case 'critical':
      return <AlertCircle className="w-4 h-4" />;
    case 'warning':
      return <Clock className="w-4 h-4" />;
    case 'suggestion':
      return <CheckCircle className="w-4 h-4" />;
    default:
      return null;
  }
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
                  {submission.user && (
                    <>
                      <span>•</span>
                      <span>by {submission.user.name}</span>
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
          <div>
            {/* AI Review Button - Only for students viewing their own submissions */}
            {user.role === 'student' && user.id === submission.user?.id && (
              <div className="mb-4 flex items-center justify-between bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-900">AI Code Review</p>
                    <p className="text-sm text-slate-600">
                      Get instant feedback on your code
                      {aiQuota && (
                        <span className="ml-2 text-purple-600">
                          ({aiQuota.remaining_today}/{aiQuota.total_limit} left today)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleAIAnalysis}
                  disabled={aiQuota && aiQuota.remaining_today === 0}
                  className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 ${
                    aiQuota && aiQuota.remaining_today === 0
                      ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                      : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:shadow-lg hover:scale-105'
                  }`}
                >
                  <Sparkles className="w-5 h-5" />
                  <span>{aiQuota && aiQuota.remaining_today === 0 ? 'Quota Exhausted' : 'Analyze Code'}</span>
                </button>
              </div>
            )}

            <div className="bg-slate-900 rounded-xl p-6 overflow-auto">
              <pre className="text-slate-100 text-sm font-mono whitespace-pre-wrap">
                {submission.code_content}
              </pre>
            </div>
          </div>
        )}
      </div>

      {/* Video Walkthrough Section */}
      {(submission.video_url || submission.video_walkthrough_url || submission.videoUrl) && (
        <div className="bg-white rounded-2xl p-8 shadow-lg border border-slate-200 mb-6">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-purple-400 rounded-full flex items-center justify-center">
              <Video className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">Code Walkthrough</h2>
              <p className="text-sm text-slate-600">Student's explanation and demonstration</p>
            </div>
          </div>
          
          <div className="bg-slate-900 rounded-xl overflow-hidden">
            <video 
              src={submission.video_url || submission.video_walkthrough_url || submission.videoUrl}
              controls
              controlsList="nodownload"
              className="w-full max-h-[600px]"
              preload="metadata"
            >
              Your browser does not support the video tag.
            </video>
          </div>
          
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              💡 <strong>Tip:</strong> Watch the student's walkthrough to understand their thought process, 
              design decisions, and specific areas where they want feedback. This context will help you 
              provide more targeted and valuable code reviews.
            </p>
          </div>
        </div>
      )}

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
      {/* AI Analysis Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden animate-slide-up">
            {/* Header */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-6 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-purple-500" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">AI Code Analysis</h2>
                  <p className="text-purple-100 text-sm">Powered by Gemini AI</p>
                </div>
              </div>
              <button
                onClick={closeAIModal}
                className="w-10 h-10 bg-white bg-opacity-20 hover:bg-opacity-30 rounded-full flex items-center justify-center transition-all"
              >
                <X className="w-6 h-6 text-white" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              {aiLoading ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-purple-500 mb-4"></div>
                  <p className="text-slate-600 text-lg font-medium">Analyzing your code...</p>
                  <p className="text-slate-500 text-sm mt-2">This may take a few seconds</p>
                </div>
              ) : aiAnalysis?.error ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
                  <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-3" />
                  <p className="text-red-700 font-semibold mb-2">Analysis Failed</p>
                  <p className="text-red-600 text-sm">{aiAnalysis.message}</p>
                </div>
              ) : aiAnalysis ? (
                <div className="space-y-6">
                  {/* Score Card */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-xl p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-slate-600 mb-1">Overall Code Quality</p>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-1">
                            {[...Array(10)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-5 h-5 ${
                                  i < aiAnalysis.overall_score
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-slate-300'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-3xl font-bold text-purple-600">
                            {aiAnalysis.overall_score}/10
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-slate-600">Analysis Time</p>
                        <p className="text-lg font-semibold text-slate-900">
                          {aiAnalysis.analysis_time}s
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Summary */}
                  <div className="bg-white border border-slate-200 rounded-xl p-6">
                    <h3 className="font-bold text-slate-900 mb-3 flex items-center space-x-2">
                      <MessageSquare className="w-5 h-5 text-purple-500" />
                      <span>Summary</span>
                    </h3>
                    <p className="text-slate-700 leading-relaxed">{aiAnalysis.summary}</p>
                  </div>

                  {/* Issues */}
                  {aiAnalysis.issues && aiAnalysis.issues.length > 0 ? (
                    <div>
                      <h3 className="font-bold text-slate-900 mb-4 flex items-center space-x-2">
                        <AlertCircle className="w-5 h-5 text-purple-500" />
                        <span>Issues Found ({aiAnalysis.issues.length})</span>
                      </h3>
                      <div className="space-y-4">
                        {aiAnalysis.issues.map((issue, idx) => (
                          <div
                            key={idx}
                            className={`border-l-4 rounded-lg p-4 ${getSeverityColor(issue.severity)}`}
                          >
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center space-x-2">
                                {getSeverityIcon(issue.severity)}
                                <span className="font-semibold capitalize">
                                  {issue.severity}
                                </span>
                                {issue.line && (
                                  <span className="px-2 py-1 bg-white rounded text-xs font-mono">
                                    Line {issue.line}
                                  </span>
                                )}
                              </div>
                            </div>
                            <p className="text-sm font-medium mb-2">{issue.message}</p>
                            <div className="bg-white bg-opacity-50 rounded p-3 text-sm">
                              <p className="font-medium text-slate-700 mb-1">💡 Suggestion:</p>
                              <p className="text-slate-600">{issue.suggestion}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                      <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                      <p className="text-green-700 font-semibold">Great job! No issues found.</p>
                      <p className="text-green-600 text-sm mt-1">Your code looks clean!</p>
                    </div>
                  )}

                  {/* Quota Info */}
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-600">
                        Remaining analyses today: <strong>{aiAnalysis.remaining_analyses_today}</strong>
                      </span>
                      <button
                        onClick={handleAIAnalysis}
                        disabled={aiAnalysis.remaining_analyses_today === 0}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                          aiAnalysis.remaining_analyses_today === 0
                            ? 'bg-slate-200 text-slate-500 cursor-not-allowed'
                            : 'bg-purple-500 text-white hover:bg-purple-600'
                        }`}
                      >
                        Re-analyze
                      </button>
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}