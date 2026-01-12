import React, { useState } from 'react';
import { createSubmissionAPI } from '../../services/api';

export default function CreateSubmissionView({ onViewChange, onSubmissionCreated }) {
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