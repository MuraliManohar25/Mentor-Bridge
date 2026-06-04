import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Users,
  TrendingUp,
  UserCheck,
  Activity,
  Briefcase,
  Calendar,
  Bell,
  Globe,
  CheckCircle,
  XCircle,
  LogOut,
  Search,
  Filter,
  BarChart3,
  PlusCircle,
  Megaphone,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';
import UserVerificationTable from '../../components/UserVerificationTable';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const AdminDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    stats,
    users,
    announcements,
    overseasJobs,
    events,
    loading,
    verifyUser,
    deactivateUser,
    deleteUser,
    searchUsers,
    filterByVerificationStatus,
    createAnnouncement,
    createOverseasJob,
    approveEvent,
  } = useAdminDashboard();

  const [activeSection, setActiveSection] = useState<'overview' | 'users' | 'content' | 'events'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('all');
  const [showAnnouncementForm, setShowAnnouncementForm] = useState(false);
  const [showJobForm, setShowJobForm] = useState(false);

  // Form states
  const [announcementForm, setAnnouncementForm] = useState({
    title: '',
    content: '',
    type: 'info' as 'info' | 'warning' | 'success',
  });

  const [jobForm, setJobForm] = useState({
    title: '',
    company: '',
    country: '',
    description: '',
    requirements: [''],
    salary_range: '',
    status: 'active' as 'active' | 'closed',
  });

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    searchUsers(query);
  };

  const handleFilterChange = (status: string) => {
    setVerificationFilter(status);
    filterByVerificationStatus(status);
  };

  const handleCreateAnnouncement = () => {
    if (announcementForm.title && announcementForm.content) {
      createAnnouncement(announcementForm);
      setAnnouncementForm({ title: '', content: '', type: 'info' });
      setShowAnnouncementForm(false);
    }
  };

  const handleCreateJob = () => {
    if (jobForm.title && jobForm.company && jobForm.country) {
      createOverseasJob({
        ...jobForm,
        requirements: jobForm.requirements.filter(r => r.trim()),
      });
      setJobForm({
        title: '',
        company: '',
        country: '',
        description: '',
        requirements: [''],
        salary_range: '',
        status: 'active',
      });
      setShowJobForm(false);
    }
  };

  // Prepare chart data
  const departmentChartData = Object.entries(stats.usersByDepartment).map(([name, value]) => ({
    name,
    users: value,
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Activity className="w-12 h-12 text-forest-dark animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-forest-dark">Admin Control Center</h1>
              <p className="text-gray-600 mt-1">System management and analytics</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 bg-green-50 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-gray-700">System Healthy</span>
              </div>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
              >
                <LogOut size={18} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Navigation Tabs */}
        <div className="flex gap-2 mb-8 bg-white p-2 rounded-xl shadow-sm">
          {(['overview', 'users', 'content', 'events'] as const).map((section) => (
            <button
              key={section}
              onClick={() => setActiveSection(section)}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all capitalize ${
                activeSection === section
                  ? 'bg-forest-dark text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {section}
            </button>
          ))}
        </div>

        {/* Overview Section */}
        {activeSection === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <Users className="text-blue-600" size={24} />
                  </div>
                  <span className="text-green-600 text-sm font-semibold flex items-center gap-1">
                    <TrendingUp size={16} />
                    +12%
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalUsers}</h3>
                <p className="text-sm text-gray-600">Total Users</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <UserCheck className="text-forest-dark" size={24} />
                  </div>
                  <span className="text-green-600 text-sm font-semibold flex items-center gap-1">
                    <TrendingUp size={16} />
                    +23%
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.newSignups30Days}</h3>
                <p className="text-sm text-gray-600">New Signups (30d)</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <Activity className="text-purple-600" size={24} />
                  </div>
                  <span className="text-green-600 text-sm font-semibold flex items-center gap-1">
                    <TrendingUp size={16} />
                    +8%
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.activeMentorships}</h3>
                <p className="text-sm text-gray-600">Active Mentorships</p>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Briefcase className="text-orange-600" size={24} />
                  </div>
                  <span className="text-green-600 text-sm font-semibold flex items-center gap-1">
                    <TrendingUp size={16} />
                    +15%
                  </span>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{stats.totalJobsPosted}</h3>
                <p className="text-sm text-gray-600">Jobs Posted</p>
              </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Department Distribution Chart */}
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <BarChart3 className="text-forest-dark" size={24} />
                  User Distribution by Department
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={departmentChartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="users" fill="#1B5E20" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Role Distribution */}
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Users by Role</h3>
                <div className="space-y-4">
                  {Object.entries(stats.usersByRole).map(([role, count]) => (
                    <div key={role}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-700 capitalize font-medium">{role}</span>
                        <span className="text-gray-900 font-bold">{count}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-forest-dark h-3 rounded-full transition-all"
                          style={{ width: `${(count / stats.totalUsers) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Announcements</h3>
              {announcements.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No announcements yet</p>
              ) : (
                <div className="space-y-4">
                  {announcements.slice(0, 3).map((announcement) => (
                    <div
                      key={announcement.id}
                      className={`p-4 rounded-lg border-l-4 ${
                        announcement.type === 'warning'
                          ? 'bg-yellow-50 border-yellow-500'
                          : announcement.type === 'success'
                          ? 'bg-green-50 border-green-500'
                          : 'bg-blue-50 border-blue-500'
                      }`}
                    >
                      <h4 className="font-semibold text-gray-900 mb-1">{announcement.title}</h4>
                      <p className="text-sm text-gray-700">{announcement.content}</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Posted on {new Date(announcement.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Users Section */}
        {activeSection === 'users' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Filters */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
              <div className="flex flex-col lg:flex-row gap-4">
                {/* Search */}
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-dark focus:border-transparent"
                  />
                </div>

                {/* Verification Filter */}
                <div className="lg:w-64">
                  <select
                    value={verificationFilter}
                    onChange={(e) => handleFilterChange(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-dark focus:border-transparent"
                  >
                    <option value="all">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="verified">Verified</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>

            {/* User Table */}
            <UserVerificationTable
              users={users}
              onVerify={verifyUser}
              onDeactivate={deactivateUser}
              onDelete={deleteUser}
            />
          </motion.div>
        )}

        {/* Content Section */}
        {activeSection === 'content' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Global Announcements */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Megaphone className="text-forest-dark" size={28} />
                  Global Announcements
                </h3>
                <button
                  onClick={() => setShowAnnouncementForm(!showAnnouncementForm)}
                  className="flex items-center gap-2 px-4 py-2 bg-forest-dark text-white rounded-lg hover:bg-forest-light transition-colors"
                >
                  <PlusCircle size={18} />
                  New Announcement
                </button>
              </div>

              {/* Announcement Form */}
              {showAnnouncementForm && (
                <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Announcement Title"
                      value={announcementForm.title}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, title: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-dark focus:border-transparent"
                    />
                    <textarea
                      placeholder="Announcement Content"
                      value={announcementForm.content}
                      onChange={(e) => setAnnouncementForm({ ...announcementForm, content: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-dark focus:border-transparent"
                    />
                    <div className="flex items-center gap-4">
                      <select
                        value={announcementForm.type}
                        onChange={(e) =>
                          setAnnouncementForm({ ...announcementForm, type: e.target.value as any })
                        }
                        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-dark focus:border-transparent"
                      >
                        <option value="info">Info</option>
                        <option value="warning">Warning</option>
                        <option value="success">Success</option>
                      </select>
                      <button
                        onClick={handleCreateAnnouncement}
                        className="px-6 py-2 bg-forest-dark text-white rounded-lg hover:bg-forest-light transition-colors font-medium"
                      >
                        Post Announcement
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Announcements List */}
              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className={`p-5 rounded-lg border-l-4 ${
                      announcement.type === 'warning'
                        ? 'bg-yellow-50 border-yellow-500'
                        : announcement.type === 'success'
                        ? 'bg-green-50 border-green-500'
                        : 'bg-blue-50 border-blue-500'
                    }`}
                  >
                    <h4 className="font-bold text-gray-900 mb-2">{announcement.title}</h4>
                    <p className="text-gray-700 mb-3">{announcement.content}</p>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <span>By {announcement.created_by}</span>
                      <span>•</span>
                      <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Overseas Jobs */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Globe className="text-forest-dark" size={28} />
                  Overseas Job Board
                </h3>
                <button
                  onClick={() => setShowJobForm(!showJobForm)}
                  className="flex items-center gap-2 px-4 py-2 bg-forest-dark text-white rounded-lg hover:bg-forest-light transition-colors"
                >
                  <PlusCircle size={18} />
                  Post Overseas Job
                </button>
              </div>

              {/* Job Form */}
              {showJobForm && (
                <div className="mb-6 p-6 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Job Title"
                        value={jobForm.title}
                        onChange={(e) => setJobForm({ ...jobForm, title: e.target.value })}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-dark focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Company"
                        value={jobForm.company}
                        onChange={(e) => setJobForm({ ...jobForm, company: e.target.value })}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-dark focus:border-transparent"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Country"
                        value={jobForm.country}
                        onChange={(e) => setJobForm({ ...jobForm, country: e.target.value })}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-dark focus:border-transparent"
                      />
                      <input
                        type="text"
                        placeholder="Salary Range (e.g., $80k - $120k)"
                        value={jobForm.salary_range}
                        onChange={(e) => setJobForm({ ...jobForm, salary_range: e.target.value })}
                        className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-dark focus:border-transparent"
                      />
                    </div>
                    <textarea
                      placeholder="Job Description"
                      value={jobForm.description}
                      onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                      rows={4}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-forest-dark focus:border-transparent"
                    />
                    <button
                      onClick={handleCreateJob}
                      className="px-6 py-2 bg-forest-dark text-white rounded-lg hover:bg-forest-light transition-colors font-medium"
                    >
                      Post Job
                    </button>
                  </div>
                </div>
              )}

              {/* Jobs List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {overseasJobs.map((job) => (
                  <div key={job.id} className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg">{job.title}</h4>
                        <p className="text-gray-600">{job.company}</p>
                      </div>
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        {job.country}
                      </span>
                    </div>
                    <p className="text-gray-700 mb-3 line-clamp-2">{job.description}</p>
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      {job.requirements.slice(0, 3).map((req, idx) => (
                        <span key={idx} className="px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm">
                          {req}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-green-600 font-semibold">{job.salary_range}</span>
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium flex items-center gap-1">
                        <CheckCircle size={12} />
                        Official
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Events Section */}
        {activeSection === 'events' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Calendar className="text-forest-dark" size={28} />
                Event Approval Queue
              </h3>

              {events.filter(e => e.status === 'pending').length === 0 ? (
                <div className="text-center py-12">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No events pending approval</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {events
                    .filter((e) => e.status === 'pending')
                    .map((event) => (
                      <div
                        key={event.id}
                        className="p-6 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-900 text-lg mb-2">{event.title}</h4>
                            <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                              <span>Organizer: {event.organizer}</span>
                              <span>•</span>
                              <span>
                                Date: {new Date(event.date).toLocaleDateString()}
                              </span>
                              <span>•</span>
                              <span>{event.attendees} expected attendees</span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => approveEvent(event.id, 'approved')}
                              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                            >
                              <CheckCircle size={18} />
                              Approve
                            </button>
                            <button
                              onClick={() => approveEvent(event.id, 'rejected')}
                              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                            >
                              <XCircle size={18} />
                              Reject
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
};

export default AdminDashboard;
