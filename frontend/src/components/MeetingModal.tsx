import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, CheckCircle, Calendar, Clock, Video } from 'lucide-react';
import { createMeeting, CreateMeeting } from '../services/meetingService';

interface MeetingModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string;
  alumniId: string;
  mentorshipRequestId?: string;
  studentName?: string;
  alumniName?: string;
}

const MeetingModal: React.FC<MeetingModalProps> = ({
  isOpen,
  onClose,
  studentId,
  alumniId,
  mentorshipRequestId,
  studentName,
  alumniName,
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [duration, setDuration] = useState(30);
  const [meetingLink, setMeetingLink] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !scheduledAt) return;
    if (title.trim().length < 5) {
      setError('Title must be at least 5 characters long');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const meetingData: CreateMeeting = {
        student_id: studentId,
        alumni_id: alumniId,
        mentorship_request_id: mentorshipRequestId,
        title: title.trim(),
        description: description.trim() || undefined,
        scheduled_at: new Date(scheduledAt).toISOString(),
        duration_minutes: duration,
        meeting_link: meetingLink.trim() || undefined,
      };

      await createMeeting(meetingData);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setTitle('');
        setDescription('');
        setScheduledAt('');
        setDuration(30);
        setMeetingLink('');
        onClose();
      }, 2000);
    } catch (err: any) {
      setError(err.message || 'Failed to schedule meeting');
    } finally {
      setLoading(false);
    }
  };

  // Get minimum date (tomorrow)
  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 16);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gradient-to-r from-primary to-accent p-6 rounded-t-2xl">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Schedule Meeting</h2>
                    <p className="text-white/90 mt-1">
                      {studentName && alumniName
                        ? `${studentName} ↔ ${alumniName}`
                        : 'Mentorship Meeting'}
                    </p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/20"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="p-6">
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 mb-6 text-sm">
                    {error}
                  </div>
                )}

                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-primary/10 border border-primary text-primary rounded-xl p-4 mb-6 flex items-center gap-3"
                  >
                    <CheckCircle size={24} />
                    <div>
                      <p className="font-semibold">Meeting Scheduled Successfully!</p>
                      <p className="text-sm">The other party will be notified.</p>
                    </div>
                  </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Meeting Title *
                    </label>
                    <input
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="e.g., Career Guidance Session"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      required
                      disabled={loading || success}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value.slice(0, 1000))}
                      placeholder="What would you like to discuss in this meeting?"
                      rows={3}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                      disabled={loading || success}
                    />
                    <p className="text-sm text-gray-500 mt-2">{description.length}/1000 characters</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Calendar size={16} className="inline mr-1" />
                        Date & Time *
                      </label>
                      <input
                        type="datetime-local"
                        value={scheduledAt}
                        onChange={(e) => setScheduledAt(e.target.value)}
                        min={getMinDate()}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                        required
                        disabled={loading || success}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        <Clock size={16} className="inline mr-1" />
                        Duration (minutes)
                      </label>
                      <select
                        value={duration}
                        onChange={(e) => setDuration(Number(e.target.value))}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                        disabled={loading || success}
                      >
                        <option value={15}>15 minutes</option>
                        <option value={30}>30 minutes</option>
                        <option value={45}>45 minutes</option>
                        <option value={60}>1 hour</option>
                        <option value={90}>1.5 hours</option>
                        <option value={120}>2 hours</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      <Video size={16} className="inline mr-1" />
                      Meeting Link (Optional)
                    </label>
                    <input
                      type="url"
                      value={meetingLink}
                      onChange={(e) => setMeetingLink(e.target.value)}
                      placeholder="https://zoom.us/... or https://meet.google.com/..."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent"
                      disabled={loading || success}
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Add a video conference link for the meeting
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                      disabled={loading || success}
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-secondary transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={loading || success || !title.trim() || !scheduledAt}
                    >
                      {loading ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          Scheduling...
                        </>
                      ) : (
                        <>
                          <Send size={20} />
                          Schedule Meeting
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default MeetingModal;
