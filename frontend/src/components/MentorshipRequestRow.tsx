import React from 'react';
import { motion } from 'framer-motion';
import { Mail, Calendar, GraduationCap, MessageSquare, Check, X } from 'lucide-react';
import { Mentee } from '../hooks/useAlumniManagement';

interface MentorshipRequestRowProps {
  mentee: Mentee;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
}

const MentorshipRequestRow: React.FC<MentorshipRequestRowProps> = ({ mentee, onAccept, onDecline }) => {
  const [expanded, setExpanded] = React.useState(false);
  const [processing, setProcessing] = React.useState(false);

  const handleAction = async (action: 'accept' | 'decline') => {
    setProcessing(true);
    setTimeout(() => {
      if (action === 'accept') {
        onAccept(mentee.id);
      } else {
        onDecline(mentee.id);
      }
      setProcessing(false);
    }, 500);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow"
    >
      <div className="flex items-start justify-between gap-4">
        {/* Student Info */}
        <div className="flex-1 space-y-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center text-white font-bold text-lg">
              {mentee.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">{mentee.name}</h4>
              <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                <span className="flex items-center gap-1">
                  <Mail size={14} />
                  {mentee.email}
                </span>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="flex flex-wrap gap-3 text-sm">
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg text-gray-700">
              <GraduationCap size={16} />
              {mentee.department}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 rounded-lg text-gray-700">
              <Calendar size={16} />
              Class of {mentee.graduation_year}
            </span>
            <span className="text-gray-500 ml-auto">
              Requested {new Date(mentee.requestDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>

          {/* Message */}
          {mentee.requestMessage && (
            <div>
              <button
                onClick={() => setExpanded(!expanded)}
                className="flex items-center gap-2 text-sm text-primary hover:text-secondary font-medium"
              >
                <MessageSquare size={16} />
                {expanded ? 'Hide Message' : 'View Message'}
              </button>
              
              {expanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <p className="text-sm text-gray-700 leading-relaxed">{mentee.requestMessage}</p>
                </motion.div>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => handleAction('accept')}
            disabled={processing}
            className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-secondary transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check size={18} />
            Accept
          </button>
          <button
            onClick={() => handleAction('decline')}
            disabled={processing}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <X size={18} />
            Decline
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default MentorshipRequestRow;
