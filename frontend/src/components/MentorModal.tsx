import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, CheckCircle } from 'lucide-react';
import { Alumni } from '../hooks/useStudentDashboard';

interface MentorModalProps {
  isOpen: boolean;
  onClose: () => void;
  alumni: Alumni | null;
}

const MentorModal: React.FC<MentorModalProps> = ({ isOpen, onClose, alumni }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || !alumni) return;

    setLoading(true);
    
    // Demo mode: Simulate API call
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
        setMessage('');
        onClose();
      }, 2000);
    }, 1000);

    // Production mode:
    // try {
    //   await apiClient.post('/mentorship-requests', {
    //     mentor_id: alumni.id,
    //     request_message: message,
    //   });
    //   setSuccess(true);
    //   setTimeout(() => {
    //     onClose();
    //     setSuccess(false);
    //     setMessage('');
    //   }, 2000);
    // } catch (error) {
    //   console.error('Failed to send mentorship request:', error);
    // } finally {
    //   setLoading(false);
    // }
  };

  if (!alumni) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              {/* Header */}
              <div className="sticky top-0 bg-gradient-to-r from-primary to-accent p-6 rounded-t-2xl">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">Request Mentorship</h2>
                    <p className="text-white/90 mt-1">Connect with {alumni.name}</p>
                  </div>
                  <button
                    onClick={onClose}
                    className="text-white/80 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/20"
                  >
                    <X size={24} />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="p-6">
                {/* Alumni Info */}
                <div className="bg-gray-50 rounded-xl p-4 mb-6">
                  <div className="flex items-start gap-4">
                    <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center text-2xl font-bold">
                      {alumni.name.charAt(0)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg text-gray-900">{alumni.name}</h3>
                      <p className="text-gray-600 text-sm">{alumni.profile.position} at {alumni.profile.company}</p>
                      <p className="text-gray-500 text-sm mt-1">{alumni.profile.department} • Class of {alumni.profile.graduation_year}</p>
                      
                      {alumni.profile.skills && alumni.profile.skills.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {alumni.profile.skills.map((skill, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full font-medium"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Success Message */}
                {success && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-primary/10 border border-primary text-primary rounded-xl p-4 mb-6 flex items-center gap-3"
                  >
                    <CheckCircle size={24} />
                    <div>
                      <p className="font-semibold">Request Sent Successfully!</p>
                      <p className="text-sm">The mentor will review your request soon.</p>
                    </div>
                  </motion.div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Why do you want to connect with this mentor?
                    </label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Introduce yourself and explain why you'd like mentorship from this alumni. Be specific about what you hope to learn..."
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                      required
                      disabled={loading || success}
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      {message.length}/500 characters
                    </p>
                  </div>

                  {/* Actions */}
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
                      disabled={loading || success || !message.trim()}
                    >
                      {loading ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send size={20} />
                          Send Request
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

export default MentorModal;
