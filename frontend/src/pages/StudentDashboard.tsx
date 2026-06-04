import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Search, Users, Briefcase, Calendar, Bell, TrendingUp,
  MapPin, Clock, Bookmark, BookmarkCheck, UserPlus,
  Building, ChevronRight, LogOut
} from 'lucide-react';
import { useStudentDashboard, Alumni } from '../hooks/useStudentDashboard';
import { useDebounce } from '../hooks/useDebounce';
import { useAuth } from '../context/AuthContext';
import MentorModal from '../components/MentorModal';

const StudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const {
    alumni,
    jobs,
    events,
    announcements,
    loading,
    error,
    searchAlumni,
    toggleSaveJob,
    toggleRSVP,
  } = useStudentDashboard();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAlumni, setSelectedAlumni] = useState<Alumni | null>(null);
  const [showMentorModal, setShowMentorModal] = useState(false);
  const [activeJobTab, setActiveJobTab] = useState<'all' | 'internal' | 'external'>('all');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Debounce search
  const debouncedSearch = useDebounce(searchTerm, 500);

  React.useEffect(() => {
    searchAlumni(debouncedSearch);
  }, [debouncedSearch]);

  const handleMentorRequest = (alum: Alumni) => {
    setSelectedAlumni(alum);
    setShowMentorModal(true);
  };

  const filteredJobs = activeJobTab === 'all' 
    ? jobs 
    : jobs.filter(job => job.type === activeJobTab);

  // Skeleton Loader
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary/5">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          <div className="bg-white rounded-2xl p-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-primary/5">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
              <p className="text-gray-600 mt-1">Welcome back! Here's what's happening today.</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium"
            >
              <LogOut size={18} />
              Logout
            </button>
            <button className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors">
              <Bell className="text-gray-600" size={24} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Available Mentors</p>
                <p className="text-3xl font-bold text-primary mt-1">{alumni.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Users className="text-primary" size={24} />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Job Openings</p>
                <p className="text-3xl font-bold text-primary mt-1">{jobs.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Briefcase className="text-primary" size={24} />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Upcoming Events</p>
                <p className="text-3xl font-bold text-primary mt-1">{events.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Calendar className="text-primary" size={24} />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm">Active Connections</p>
                <p className="text-3xl font-bold text-primary mt-1">12</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="text-primary" size={24} />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Alumni & Jobs */}
          <div className="lg:col-span-2 space-y-8">
            {/* Alumni Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Users className="text-primary" size={24} />
                  Alumni Mentors
                </h2>
                <button className="text-primary font-medium text-sm flex items-center gap-1 hover:gap-2 transition-all">
                  View All
                  <ChevronRight size={16} />
                </button>
              </div>

              {/* Search Bar */}
              <div className="mb-6">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search by name, department, or skills..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>

              {/* Alumni Grid */}
              {alumni.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="mx-auto text-gray-300 mb-3" size={48} />
                  <p className="text-gray-500">No mentors found. Try a different search.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {alumni.map((alum) => (
                    <motion.div
                      key={alum.id}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-gradient-to-br from-primary/5 to-accent/5 rounded-xl p-5 border border-primary/20 hover:shadow-lg transition-all group"
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-xl font-bold flex-shrink-0">
                          {alum.name.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-900 truncate">{alum.name}</h3>
                          <p className="text-sm text-gray-600 truncate">{alum.profile.position}</p>
                          <p className="text-xs text-gray-500 truncate">{alum.profile.company}</p>
                          
                          {alum.profile.skills && (
                            <div className="flex flex-wrap gap-1 mt-2">
                              {alum.profile.skills.slice(0, 3).map((skill, idx) => (
                                <span
                                  key={idx}
                                  className="px-2 py-0.5 bg-white text-primary text-xs rounded-full font-medium"
                                >
                                  {skill}
                                </span>
                              ))}
                            </div>
                          )}

                          <button
                            onClick={() => handleMentorRequest(alum)}
                            className="mt-3 w-full px-3 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-secondary transition-colors flex items-center justify-center gap-2"
                          >
                            <UserPlus size={16} />
                            Request Mentorship
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Jobs Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8"
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Briefcase className="text-primary" size={24} />
                  Job Board
                </h2>
              </div>

              {/* Job Tabs */}
              <div className="flex gap-2 mb-8 bg-gray-100 rounded-lg p-1">
                {['all', 'internal', 'external'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveJobTab(tab as any)}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-all ${
                      activeJobTab === tab
                        ? 'bg-white text-primary shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    <span className="ml-2 text-xs">
                      ({tab === 'all' ? jobs.length : jobs.filter(j => j.type === tab).length})
                    </span>
                  </button>
                ))}
              </div>

              {/* Jobs List */}
              <div className="space-y-5">
                {filteredJobs.map((job) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all group"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900">{job.title}</h3>
                          <span className={`px-2 py-0.5 text-xs rounded-full font-medium ${
                            job.type === 'internal'
                              ? 'bg-primary/10 text-primary'
                              : 'bg-blue-100 text-blue-700'
                          }`}>
                            {job.type === 'internal' ? 'Alumni' : 'External'}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                          <Building size={14} />
                          {job.company}
                        </p>
                        <p className="text-sm text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin size={14} />
                          {job.location}
                        </p>
                      </div>
                      <button
                        onClick={() => toggleSaveJob(job.id)}
                        className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                      >
                        {job.saved ? (
                          <BookmarkCheck className="text-primary" size={20} />
                        ) : (
                          <Bookmark className="text-gray-400" size={20} />
                        )}
                      </button>
                    </div>

                    <p className="text-sm text-gray-700 mb-3">{job.description}</p>

                    {/* Skills */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {job.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md font-medium"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                      <p className="text-xs text-gray-500">Posted by {job.postedBy}</p>
                      <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-secondary transition-colors">
                        Apply Now
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column - Events & Announcements */}
          <div className="space-y-8">
            {/* Events */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Calendar className="text-primary" size={24} />
                Upcoming Events
              </h2>

              <div className="space-y-5">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-all"
                  >
                    <h3 className="font-semibold text-gray-900 mb-2">{event.title}</h3>
                    <div className="space-y-1 mb-3">
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Calendar size={14} />
                        {new Date(event.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <Clock size={14} />
                        {event.time}
                      </p>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        <MapPin size={14} />
                        {event.location}
                      </p>
                    </div>
                    <p className="text-xs text-gray-500 mb-3">{event.attendees} attending</p>
                    <button
                      onClick={() => toggleRSVP(event.id)}
                      className={`w-full py-2 rounded-lg font-medium text-sm transition-colors ${
                        event.isRSVPed
                          ? 'bg-primary/10 text-primary border border-primary'
                          : 'bg-primary text-white hover:bg-secondary'
                      }`}
                    >
                      {event.isRSVPed ? '✓ Registered' : 'RSVP Now'}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Announcements */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-7"
            >
              <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Bell className="text-primary" size={24} />
                Announcements
              </h2>

              <div className="space-y-4">
                {announcements.map((announcement) => (
                  <div
                    key={announcement.id}
                    className={`p-5 rounded-xl border ${
                      announcement.priority === 'high'
                        ? 'bg-red-50 border-red-200'
                        : announcement.priority === 'medium'
                        ? 'bg-yellow-50 border-yellow-200'
                        : 'bg-blue-50 border-blue-200'
                    }`}
                  >
                    <h3 className="font-semibold text-gray-900 mb-1">{announcement.title}</h3>
                    <p className="text-sm text-gray-700 mb-2">{announcement.message}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(announcement.date).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Mentor Modal */}
      <MentorModal
        isOpen={showMentorModal}
        onClose={() => setShowMentorModal(false)}
        alumni={selectedAlumni}
      />
    </div>
  );
};

export default StudentDashboard;
