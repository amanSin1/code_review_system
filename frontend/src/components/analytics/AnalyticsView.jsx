import React, { useState, useEffect } from 'react';
import { 
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  TrendingUp, Users, Star, Clock, Code2, CheckCircle2, 
  Activity, Award, Calendar, Target, Shield, UserCheck, Trophy
} from 'lucide-react';

import { fetchStudentAnalyticsAPI, fetchMentorAnalyticsAPI, fetchAdminAnalyticsAPI } from '../../services/api';

export default function AnalyticsView({ user }) {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, [user.role]);

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      let data;
      if (user.role === 'student') {
        data = await fetchStudentAnalyticsAPI();
      } else if (user.role === 'mentor') {
        data = await fetchMentorAnalyticsAPI();
      } else if (user.role === 'admin') {
        data = await fetchAdminAnalyticsAPI();
      }
      setAnalytics(data);
    } catch (err) {
      console.error('Failed to load analytics:', err);
      alert('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Failed to load analytics</p>
      </div>
    );
  }

  const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'];

  // Render admin view
  if (user.role === 'admin') {
    return (
      <div className="animate-fade-in">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 mb-2 flex items-center gap-3">
            <Shield className="w-8 h-8 text-purple-600" />
            Platform Analytics
          </h1>
          <p className="text-slate-600">
            Overview of platform-wide statistics and user activity
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <SummaryCard
            icon={<Code2 className="w-6 h-6" />}
            title="Total Submissions"
            value={analytics.summary.total_submissions}
            color="purple"
          />
          <SummaryCard
            icon={<CheckCircle2 className="w-6 h-6" />}
            title="Total Reviews"
            value={analytics.summary.total_reviews}
            color="green"
          />
          <SummaryCard
            icon={<Users className="w-6 h-6" />}
            title="Total Users"
            value={analytics.users_by_role.reduce((sum, role) => sum + role.count, 0)}
            color="blue"
          />
          <SummaryCard
            icon={<Activity className="w-6 h-6" />}
            title="Completion Rate"
            value={`${((analytics.summary.total_reviews / analytics.summary.total_submissions) * 100).toFixed(0)}%`}
            color="yellow"
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Users by Role */}
          <ChartCard title="👥 Users by Role">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={analytics.users_by_role}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ role, percent }) => `${role} (${(percent * 100).toFixed(0)}%)`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {analytics.users_by_role.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Platform Activity */}
          <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-8 text-white shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <Trophy className="w-8 h-8" />
              <h3 className="text-2xl font-bold">Platform Health</h3>
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-purple-100">Review Coverage</span>
                <span className="text-2xl font-bold">
                  {((analytics.summary.total_reviews / analytics.summary.total_submissions) * 100).toFixed(0)}%
                </span>
              </div>
              <div className="w-full bg-purple-400 rounded-full h-3">
                <div 
                  className="bg-white rounded-full h-3 transition-all duration-500"
                  style={{ width: `${(analytics.summary.total_reviews / analytics.summary.total_submissions) * 100}%` }}
                ></div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <p className="text-purple-100 text-sm">Avg per Student</p>
                  <p className="text-2xl font-bold">
                    {(analytics.summary.total_submissions / analytics.users_by_role.find(r => r.role === 'student')?.count || 1).toFixed(1)}
                  </p>
                </div>
                <div>
                  <p className="text-purple-100 text-sm">Avg per Mentor</p>
                  <p className="text-2xl font-bold">
                    {(analytics.summary.total_reviews / analytics.users_by_role.find(r => r.role === 'mentor')?.count || 1).toFixed(1)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Leaderboards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Most Active Students */}
          <ChartCard title="🏆 Most Active Students">
            <div className="space-y-3">
              {analytics.most_active_students.map((student, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg hover:from-purple-100 hover:to-pink-100 transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                      idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-slate-400' : idx === 2 ? 'bg-orange-600' : 'bg-purple-400'
                    }`}>
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{student.name}</p>
                      <p className="text-sm text-slate-600">{student.submissions} submissions</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-purple-500 rounded-full"
                        style={{ width: `${(student.submissions / analytics.most_active_students[0].submissions) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>

          {/* Most Active Mentors */}
          <ChartCard title="⭐ Most Active Mentors">
            <div className="space-y-3">
              {analytics.most_active_mentors.map((mentor, idx) => (
                <div 
                  key={idx}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg hover:from-blue-100 hover:to-cyan-100 transition-all"
                >
                  <div className="flex items-center space-x-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                      idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-slate-400' : idx === 2 ? 'bg-orange-600' : 'bg-blue-400'
                    }`}>
                      {idx + 1}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{mentor.name}</p>
                      <p className="text-sm text-slate-600">{mentor.reviews} reviews</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="w-16 h-2 bg-slate-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(mentor.reviews / analytics.most_active_mentors[0].reviews) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ChartCard>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center space-x-3 mb-3">
              <UserCheck className="w-6 h-6 text-green-500" />
              <h4 className="font-semibold text-slate-900">Student Engagement</h4>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {analytics.users_by_role.find(r => r.role === 'student')?.count || 0}
            </p>
            <p className="text-sm text-slate-600 mt-1">Active students on platform</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center space-x-3 mb-3">
              <Star className="w-6 h-6 text-yellow-500" />
              <h4 className="font-semibold text-slate-900">Mentor Capacity</h4>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {analytics.users_by_role.find(r => r.role === 'mentor')?.count || 0}
            </p>
            <p className="text-sm text-slate-600 mt-1">Available mentors</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
            <div className="flex items-center space-x-3 mb-3">
              <TrendingUp className="w-6 h-6 text-purple-500" />
              <h4 className="font-semibold text-slate-900">Student/Mentor Ratio</h4>
            </div>
            <p className="text-3xl font-bold text-slate-900">
              {((analytics.users_by_role.find(r => r.role === 'student')?.count || 0) / 
                (analytics.users_by_role.find(r => r.role === 'mentor')?.count || 1)).toFixed(1)}:1
            </p>
            <p className="text-sm text-slate-600 mt-1">Students per mentor</p>
          </div>
        </div>
      </div>
    );
  }

  // Render student/mentor views (existing code)
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          {user.role === 'student' ? '📊 My Analytics' : '📊 Mentoring Analytics'}
        </h1>
        <p className="text-slate-600">
          {user.role === 'student' 
            ? 'Track your progress and code quality trends' 
            : 'Your impact and mentoring statistics'}
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {user.role === 'student' ? (
          <>
            <SummaryCard
              icon={<Code2 className="w-6 h-6" />}
              title="Total Submissions"
              value={analytics.summary.total_submissions}
              color="purple"
            />
            <SummaryCard
              icon={<CheckCircle2 className="w-6 h-6" />}
              title="Reviews Received"
              value={analytics.summary.total_reviews_received}
              color="green"
            />
            <SummaryCard
              icon={<Star className="w-6 h-6" />}
              title="Average Rating"
              value={analytics.summary.avg_rating.toFixed(1)}
              color="yellow"
            />
            <SummaryCard
              icon={<Clock className="w-6 h-6" />}
              title="Avg Review Time"
              value={`${analytics.summary.avg_review_time_days}d`}
              color="blue"
            />
          </>
        ) : (
          <>
            <SummaryCard
              icon={<CheckCircle2 className="w-6 h-6" />}
              title="Reviews Given"
              value={analytics.summary.total_reviews_given}
              color="purple"
            />
            <SummaryCard
              icon={<Users className="w-6 h-6" />}
              title="Students Helped"
              value={analytics.summary.students_helped}
              color="green"
            />
            <SummaryCard
              icon={<Star className="w-6 h-6" />}
              title="Avg Rating Given"
              value={analytics.summary.avg_rating_given.toFixed(1)}
              color="yellow"
            />
            <SummaryCard
              icon={<Clock className="w-6 h-6" />}
              title="Avg Response Time"
              value={`${analytics.summary.avg_response_time_days}d`}
              color="blue"
            />
          </>
        )}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Timeline Chart */}
        <ChartCard title={user.role === 'student' ? '📈 Submissions Over Time' : '📈 Reviews Over Time'}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={user.role === 'student' ? analytics.submissions_timeline : analytics.reviews_timeline}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#fff', 
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                }} 
              />
              <Line 
                type="monotone" 
                dataKey="count" 
                stroke="#8b5cf6" 
                strokeWidth={3}
                dot={{ fill: '#8b5cf6', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Language Breakdown */}
        <ChartCard title="🔤 Language Breakdown">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.language_breakdown}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="count"
              >
                {analytics.language_breakdown.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Additional Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {user.role === 'student' ? (
          <>
            {/* Rating Trend */}
            {analytics.rating_timeline && analytics.rating_timeline.length > 0 && (
              <ChartCard title="⭐ Rating Trend">
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.rating_timeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px' }} />
                    <YAxis domain={[0, 10]} stroke="#64748b" style={{ fontSize: '12px' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }} 
                    />
                    <Line 
                      type="monotone" 
                      dataKey="rating" 
                      stroke="#f59e0b" 
                      strokeWidth={3}
                      dot={{ fill: '#f59e0b', r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartCard>
            )}

            {/* Status Breakdown */}
            <ChartCard title="📊 Submission Status">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics.status_breakdown}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="status" stroke="#64748b" style={{ fontSize: '12px' }} />
                  <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e2e8f0',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }} 
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </ChartCard>
          </>
        ) : (
          <>
            {/* Rating Distribution */}
            {analytics.rating_distribution && analytics.rating_distribution.length > 0 && (
              <ChartCard title="⭐ Rating Distribution">
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.rating_distribution}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="rating" stroke="#64748b" style={{ fontSize: '12px' }} label={{ value: 'Rating', position: 'insideBottom', offset: -5 }} />
                    <YAxis stroke="#64748b" style={{ fontSize: '12px' }} label={{ value: 'Count', angle: -90, position: 'insideLeft' }} />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }} 
                    />
                    <Bar dataKey="count" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartCard>
            )}

            {/* This Month's Impact */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-8 text-white shadow-lg">
              <div className="flex items-center space-x-3 mb-6">
                <Award className="w-8 h-8" />
                <h3 className="text-2xl font-bold">This Month's Impact</h3>
              </div>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-purple-100 text-sm mb-1">Reviews Given</p>
                  <p className="text-4xl font-bold">{analytics.summary.reviews_this_month}</p>
                </div>
                <div>
                  <p className="text-purple-100 text-sm mb-1">Students Helped</p>
                  <p className="text-4xl font-bold">{analytics.summary.students_helped_this_month}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Recent Activity */}
      <ChartCard title="🕒 Recent Activity">
        <div className="space-y-3">
          {analytics.recent_activity.length === 0 ? (
            <p className="text-center text-slate-500 py-8">No recent activity</p>
          ) : (
            analytics.recent_activity.map((item, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors"
              >
                <div className="flex-1">
                  {user.role === 'student' ? (
                    <>
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <div className="flex items-center space-x-3 text-sm text-slate-600 mt-1">
                        <span className="capitalize">{item.language}</span>
                        <span>•</span>
                        <span className="capitalize">{item.status}</span>
                        <span>•</span>
                        <span>{item.review_count} reviews</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <p className="font-semibold text-slate-900">{item.submission_title}</p>
                      <div className="flex items-center space-x-3 text-sm text-slate-600 mt-1">
                        <span>Student: {item.student_name}</span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <Star className="w-3 h-3 fill-current text-yellow-500" />
                          <span>{item.rating}/10</span>
                        </span>
                      </div>
                    </>
                  )}
                </div>
                <div className="text-xs text-slate-400">
                  {item.created_at ? new Date(item.created_at).toLocaleDateString() : ''}
                </div>
              </div>
            ))
          )}
        </div>
      </ChartCard>

      {/* AI Usage Card (Students Only) */}
      {user.role === 'student' && (
        <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full flex items-center justify-center">
                <Activity className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="font-bold text-slate-900 text-lg">AI Analysis Usage</p>
                <p className="text-sm text-slate-600">Total analyses performed</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold text-purple-600">{analytics.summary.total_ai_analyses}</p>
              <p className="text-sm text-slate-600 mt-1">times</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Summary Card Component
function SummaryCard({ icon, title, value, color }) {
  const colorClasses = {
    purple: 'from-purple-400 to-purple-600',
    green: 'from-green-400 to-green-600',
    yellow: 'from-yellow-400 to-yellow-600',
    blue: 'from-blue-400 to-blue-600',
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className={`w-12 h-12 bg-gradient-to-br ${colorClasses[color]} rounded-xl flex items-center justify-center text-white`}>
          {icon}
        </div>
      </div>
      <p className="text-slate-600 text-sm mb-1">{title}</p>
      <p className="text-3xl font-bold text-slate-900">{value}</p>
    </div>
  );
}

// Chart Card Component
function ChartCard({ title, children }) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
      <h3 className="text-lg font-bold text-slate-900 mb-6">{title}</h3>
      {children}
    </div>
  );
}