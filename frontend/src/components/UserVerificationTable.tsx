import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  XCircle,
  Trash2,
  Shield,
  ShieldOff,
  Mail,
  Calendar,
  User,
  AlertTriangle,
} from 'lucide-react';
import { UserData } from '../hooks/useAdminDashboard';

interface UserVerificationTableProps {
  users: UserData[];
  onVerify: (userId: string, status: 'verified' | 'rejected') => void;
  onDeactivate: (userId: string) => void;
  onDelete: (userId: string) => void;
}

const UserVerificationTable: React.FC<UserVerificationTableProps> = ({
  users,
  onVerify,
  onDeactivate,
  onDelete,
}) => {
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleDelete = (userId: string) => {
    if (confirmDelete === userId) {
      onDelete(userId);
      setConfirmDelete(null);
    } else {
      setConfirmDelete(userId);
      setTimeout(() => setConfirmDelete(null), 3000);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
            <CheckCircle size={14} />
            Verified
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm font-medium">
            <XCircle size={14} />
            Rejected
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-yellow-100 text-yellow-700 rounded-full text-sm font-medium">
            <AlertTriangle size={14} />
            Pending
          </span>
        );
    }
  };

  const getRoleBadge = (role: string) => {
    const colors = {
      admin: 'bg-purple-100 text-purple-700',
      alumni: 'bg-blue-100 text-blue-700',
      student: 'bg-green-100 text-green-700',
    };

    return (
      <span className={`px-3 py-1 rounded-lg text-sm font-medium capitalize ${colors[role as keyof typeof colors]}`}>
        {role}
      </span>
    );
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                User
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Department
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Joined
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((user, index) => (
              <motion.tr
                key={user.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`hover:bg-gray-50 transition-colors ${!user.is_active ? 'opacity-50' : ''}`}
              >
                {/* User Info */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-forest-dark to-forest-light rounded-full flex items-center justify-center text-white font-bold">
                      {user.full_name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{user.full_name}</p>
                      <p className="text-sm text-gray-500 flex items-center gap-1">
                        <Mail size={12} />
                        {user.email}
                      </p>
                    </div>
                  </div>
                </td>

                {/* Role */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {getRoleBadge(user.role)}
                </td>

                {/* Department */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-gray-700">{user.department}</span>
                </td>

                {/* Status */}
                <td className="px-6 py-4 whitespace-nowrap">
                  {getStatusBadge(user.verification_status)}
                </td>

                {/* Joined Date */}
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <Calendar size={14} />
                    {new Date(user.created_at).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </td>

                {/* Actions */}
                <td className="px-6 py-4 whitespace-nowrap text-right">
                  <div className="flex items-center justify-end gap-2">
                    {/* Verify/Reject Buttons - Only for pending alumni */}
                    {user.verification_status === 'pending' && user.role === 'alumni' && (
                      <>
                        <button
                          onClick={() => onVerify(user.id, 'verified')}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                          title="Approve"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button
                          onClick={() => onVerify(user.id, 'rejected')}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Reject"
                        >
                          <XCircle size={18} />
                        </button>
                      </>
                    )}

                    {/* Activate/Deactivate */}
                    <button
                      onClick={() => onDeactivate(user.id)}
                      className={`p-2 ${
                        user.is_active
                          ? 'text-orange-600 hover:bg-orange-50'
                          : 'text-blue-600 hover:bg-blue-50'
                      } rounded-lg transition-colors`}
                      title={user.is_active ? 'Deactivate' : 'Activate'}
                    >
                      {user.is_active ? <ShieldOff size={18} /> : <Shield size={18} />}
                    </button>

                    {/* Delete */}
                    <button
                      onClick={() => handleDelete(user.id)}
                      className={`p-2 rounded-lg transition-colors ${
                        confirmDelete === user.id
                          ? 'bg-red-600 text-white'
                          : 'text-red-600 hover:bg-red-50'
                      }`}
                      title={confirmDelete === user.id ? 'Click again to confirm' : 'Delete'}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>

        {users.length === 0 && (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">No users found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserVerificationTable;
