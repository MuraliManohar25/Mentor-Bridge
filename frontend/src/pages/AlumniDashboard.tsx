import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Briefcase,
  UserCheck,
  TrendingUp,
  Plus,
  Search,
  MessageCircle,
  MapPin,
  ExternalLink,
  Building,
  Loader2,
  Eye,
  EyeOff,
  Mail,
  Linkedin,
  GraduationCap,
  LogOut,
} from 'lucide-react';
import { useAlumniManagement } from '../hooks/useAlumniManagement';
import { useDebounce } from '../hooks/useDebounce';
import { useAuth } from '../context/AuthContext';
import JobPostingForm from '../components/JobPostingForm';
import MentorshipRequestRow from '../components/MentorshipRequestRow';

const AlumniDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const {
    mentees,
    jobs,
    peerAlumni,
    stats,
    isMentor,
    loading,
    handleMentorshipRequest,
    createJob,
    toggleJobStatus,
    toggleMentorStatus,
    searchPeers,
  } = useAlumniManagement();

  const [activeTab, setActiveTab] = useState<'overview' | 'mentorship' | 'career'>('overview');
  const [isJobFormOpen, setIsJobFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  React.useEffect(() => {
    searchPeers(debouncedSearch);
  }, [debouncedSearch]);

  const pendingMentees = mentees.filter(m => m.status === 'pending');
  const activeMentees = mentees.filter(m => m.status === 'active');

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Alumni Dashboard</h1>
              <p className="text-gray-600 mt-1">Manage your mentorships and career opportunities</p>
            </div>

            {/* Mentor Status Toggle & Logout */}
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-4 bg-gray-50 px-5 py-3 rounded-xl">
                <span className="text-sm font-medium text-gray-700">Mentor Status:</span>
                <button
                  onClick={toggleMentorStatus}
                  className={`relative inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    isMentor
                      ? 'bg-primary text-white'
                      : 'bg-gray-300 text-gray-700'
                  }`}
                >
                  {isMentor ? (
                    <>
                      <Eye size={18} />
                      <span>Available</span>
                    </>
                  ) : (
                    <>
                      <EyeOff size={18} />
                      <span>Hidden</span>
                    </>
                  )}
                </button>
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
        {/* Tabs */}
        <div className="flex gap-2 mb-8 bg-white p-2 rounded-xl shadow-sm">
          {(['overview', 'mentorship', 'career'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 px-6 py-3 rounded-lg font-medium transition-all ${
                activeTab === tab
                  ? 'bg-primary text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              {tab === 'overview' && 'Overview'}
              {tab === 'mentorship' && `Mentorship (${stats.pendingRequests})`}
              {tab === 'career' && 'Career Center'}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                    <UserCheck className="text-blue-600" size={24} />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Active Mentees</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.activeMentees}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                    <Users className="text-orange-600" size={24} />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Pending Requests</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.pendingRequests}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                    <Briefcase className="text-primary" size={24} />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Active Jobs</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.activeJobs}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                    <TrendingUp className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <p className="text-gray-600 text-sm">Total Jobs Posted</p>
                    <p className="text-3xl font-bold text-gray-900">{stats.totalJobsPosted}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Recent Activity Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Requests */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-7">
                <h3 className="text-xl font-bold text-gray-900 mb-5">Recent Requests</h3>
                {pendingMentees.length === 0 ? (
                  <div className="text-center py-12">
                    <Users className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No pending requests</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {pendingMentees.slice(0, 3).map((mentee) => (
                      <div key={mentee.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold">
                            {mentee.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-gray-900">{mentee.name}</p>
                            <p className="text-sm text-gray-600">{mentee.department}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                    {pendingMentees.length > 3 && (
                      <button
                        onClick={() => setActiveTab('mentorship')}
                        className="w-full py-2 text-primary hover:text-secondary font-medium text-sm"
                      >
                        View all {pendingMentees.length} requests →
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Active Mentees */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-7">
                <h3 className="text-xl font-bold text-gray-900 mb-5">Active Mentees</h3>
                {activeMentees.length === 0 ? (
                  <div className="text-center py-12">
                    <UserCheck className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No active mentees yet</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {activeMentees.map((mentee) => (
                      <div key={mentee.id} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold">
                              {mentee.name.split(' ').map(n => n[0]).join('')}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{mentee.name}</p>
                              <p className="text-sm text-gray-600">{mentee.department}</p>
                            </div>
                          </div>
                          <button className="px-3 py-1.5 bg-primary text-white rounded-lg text-sm hover:bg-secondary transition-colors flex items-center gap-1.5">
                            <MessageCircle size={16} />
                            Chat
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Mentorship Tab */}
        {activeTab === 'mentorship' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Pending Requests Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Mentorship Request Inbox</h2>
                  <p className="text-gray-600 mt-1">{pendingMentees.length} pending request{pendingMentees.length !== 1 ? 's' : ''}</p>
                </div>
              </div>

              {pendingMentees.length === 0 ? (
                <div className="text-center py-16">
                  <Users className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Requests</h3>
                  <p className="text-gray-600">You're all caught up! New mentorship requests will appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <AnimatePresence>
                    {pendingMentees.map((mentee) => (
                      <MentorshipRequestRow
                        key={mentee.id}
                        mentee={mentee}
                        onAccept={(id) => handleMentorshipRequest(id, 'accept')}
                        onDecline={(id) => handleMentorshipRequest(id, 'decline')}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Active Mentees Section */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Active Mentees</h2>
                  <p className="text-gray-600 mt-1">{activeMentees.length} active mentorship{activeMentees.length !== 1 ? 's' : ''}</p>
                </div>
              </div>

              {activeMentees.length === 0 ? (
                <div className="text-center py-16">
                  <UserCheck className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Active Mentees</h3>
                  <p className="text-gray-600">Accept mentorship requests to start guiding students.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {activeMentees.map((mentee) => (
                    <motion.div
                      key={mentee.id}
                      layout
                      className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-lg">
                          {mentee.name.split(' ').map(n => n[0]).join('')}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-900">{mentee.name}</h4>
                          <p className="text-sm text-gray-600 mt-1">{mentee.department} • Class of {mentee.graduation_year}</p>
                          <div className="flex items-center gap-2 mt-3">
                            <button className="flex-1 px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors flex items-center justify-center gap-2 text-sm font-medium">
                              <MessageCircle size={16} />
                              Start Chat
                            </button>
                            <a
                              href={`mailto:${mentee.email}`}
                              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                            >
                              <Mail size={16} />
                            </a>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Career Tab */}
        {activeTab === 'career' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-8"
          >
            {/* Post Job Section */}
            <div className="bg-gradient-to-r from-primary to-accent p-8 rounded-xl text-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold mb-2">Share Career Opportunities</h2>
                  <p className="text-white/90">Help students land their dream jobs by posting openings from your company</p>
                </div>
                <button
                  onClick={() => setIsJobFormOpen(true)}
                  className="px-6 py-3 bg-white text-primary rounded-xl font-medium hover:shadow-lg transition-all flex items-center gap-2"
                >
                  <Plus size={20} />
                  Post a Job
                </button>
              </div>
            </div>

            {/* My Jobs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">My Job Postings</h2>

              {jobs.length === 0 ? (
                <div className="text-center py-16">
                  <Briefcase className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">No Jobs Posted Yet</h3>
                  <p className="text-gray-600 mb-6">Start sharing career opportunities with students</p>
                  <button
                    onClick={() => setIsJobFormOpen(true)}
                    className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-secondary transition-colors inline-flex items-center gap-2"
                  >
                    <Plus size={20} />
                    Post Your First Job
                  </button>
                </div>
              ) : (
                <div className="space-y-5">
                  {jobs.map((job) => (
                    <motion.div
                      key={job.id}
                      layout
                      className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-start gap-4">
                            <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center text-white font-bold text-lg">
                              {job.company.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-start justify-between">
                                <div>
                                  <h3 className="text-xl font-bold text-gray-900">{job.title}</h3>
                                  <div className="flex items-center gap-4 text-sm text-gray-600 mt-2">
                                    <span className="flex items-center gap-1">
                                      <Building size={16} />
                                      {job.company}
                                    </span>
                                    <span className="flex items-center gap-1">
                                      <MapPin size={16} />
                                      {job.location}
                                    </span>
                                  </div>
                                </div>
                                <span
                                  className={`px-3 py-1 rounded-full text-sm font-medium ${
                                    job.status === 'active'
                                      ? 'bg-green-100 text-green-700'
                                      : 'bg-gray-100 text-gray-700'
                                  }`}
                                >
                                  {job.status === 'active' ? 'Active' : 'Closed'}
                                </span>
                              </div>

                              <p className="text-gray-700 mt-4 leading-relaxed">{job.description}</p>

                              <div className="flex flex-wrap gap-2 mt-4">
                                {job.requirements.slice(0, 4).map((req, idx) => (
                                  <span key={idx} className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm">
                                    {req}
                                  </span>
                                ))}
                              </div>

                              <div className="flex items-center gap-4 mt-6 pt-4 border-t">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Users size={16} />
                                  <span className="font-medium">{job.applicationCount}</span> applications
                                </div>
                                <div className="text-sm text-gray-500">
                                  Posted {new Date(job.postedDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </div>
                                <div className="ml-auto flex items-center gap-2">
                                  <a
                                    href={job.applyLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2 text-sm font-medium"
                                  >
                                    <ExternalLink size={16} />
                                    View Link
                                  </a>
                                  <button
                                    onClick={() => toggleJobStatus(job.id)}
                                    className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                                      job.status === 'active'
                                        ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                        : 'bg-green-100 text-green-700 hover:bg-green-200'
                                    }`}
                                  >
                                    {job.status === 'active' ? 'Close' : 'Reopen'}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Peer Directory */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Peer Directory</h2>
                <p className="text-gray-600">Connect with fellow alumni in your network</p>
              </div>

              {/* Search */}
              <div className="relative mb-6">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Search by name, company, industry, or graduation year..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              {/* Peer Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {peerAlumni.map((peer) => (
                  <div key={peer.id} className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      <div className="w-14 h-14 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-lg">
                        {peer.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-900">{peer.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">{peer.currentPosition}</p>
                        <p className="text-sm text-gray-600">{peer.currentCompany}</p>
                        <div className="flex items-center gap-3 mt-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <GraduationCap size={14} />
                            Class of {peer.graduationYear}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin size={14} />
                            {peer.location}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                          <a
                            href={`mailto:${peer.email}`}
                            className="flex-1 px-3 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                          >
                            <Mail size={16} />
                            Email
                          </a>
                          {peer.linkedIn && (
                            <a
                              href={`https://${peer.linkedIn}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center"
                            >
                              <Linkedin size={16} />
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {peerAlumni.length === 0 && (
                <div className="text-center py-12">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No alumni found matching your search</p>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </main>

      {/* Job Posting Form Modal */}
      <JobPostingForm
        isOpen={isJobFormOpen}
        onClose={() => setIsJobFormOpen(false)}
        onSubmit={createJob}
      />
    </div>
  );
};

export default AlumniDashboard;
