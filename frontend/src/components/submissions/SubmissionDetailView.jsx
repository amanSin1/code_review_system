import React, { useState, useEffect } from 'react';
import { User, Star, MessageSquare } from 'lucide-react';
import { fetchSubmissionAPI, createReviewAPI, updateSubmissionAPI, deleteSubmissionAPI } from '../../services/api';

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