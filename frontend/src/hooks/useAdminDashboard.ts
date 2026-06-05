import { useState, useEffect, useCallback } from 'react';
import {
  getAdminStats,
  getAdminUsers,
  verifyUser as verifyUserApi,
  deactivateUser as deactivateUserApi,
  deleteUser as deleteUserApi,
} from '../services/adminService';
import { getOverseasJobs, createOverseasJob } from '../services/jobService';
import { getEvents, updateEventStatus } from '../services/eventService';
import { getAnnouncements, createAnnouncement } from '../services/announcementService';

export interface AdminStats {
  totalUsers: number;
  usersByRole: {
    admin: number;
    alumni: number;
    student: number;
  };
  newSignups30Days: number;
  activeMentorships: number;
  totalJobsPosted: number;
  usersByDepartment: { [key: string]: number };
}

export interface UserData {
  id: string;
  full_name: string;
  email: string;
  role: 'admin' | 'alumni' | 'student';
  department: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  is_active: boolean;
  created_at: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  type: 'info' | 'warning' | 'success';
  created_at: string;
  created_by: string;
}

export interface OverseasJob {
  id: string;
  title: string;
  company: string;
  country: string;
  description: string;
  requirements: string[];
  salary_range: string;
  status: 'active' | 'closed';
  is_official: boolean;
}

export interface EventForApproval {
  id: string;
  title: string;
  organizer: string;
  date: string;
  attendees: number;
  status: 'pending' | 'approved' | 'rejected';
}

const mapStats = (data: any): AdminStats => ({
  totalUsers: data.total_users,
  usersByRole: {
    admin: data.users_by_role?.admin || 0,
    alumni: data.users_by_role?.alumni || 0,
    student: data.users_by_role?.student || 0,
  },
  newSignups30Days: data.new_signups_30_days,
  activeMentorships: data.active_mentorships,
  totalJobsPosted: data.total_jobs_posted,
  usersByDepartment: data.users_by_department || {},
});

const mapUser = (user: any): UserData => ({
  id: user.id,
  full_name: user.full_name,
  email: user.email,
  role: user.role,
  department: user.department || 'N/A',
  verification_status: user.verification_status,
  is_active: user.is_active,
  created_at: user.created_at || '',
});

const mapOverseasJob = (job: any): OverseasJob => ({
  id: job.id,
  title: job.title,
  company: job.company,
  country: job.country || job.location,
  description: job.description,
  requirements: job.requirements || [],
  salary_range: job.salary_range || 'N/A',
  status: job.status,
  is_official: true,
});

const mapEvent = (event: any): EventForApproval => ({
  id: event.id,
  title: event.title,
  organizer: event.organizer_name || 'Unknown',
  date: event.event_date,
  attendees: event.attendees,
  status: event.status,
});

const mapAnnouncement = (item: any): Announcement => ({
  id: item.id,
  title: item.title,
  content: item.content,
  type: item.priority === 'high' ? 'warning' : item.priority === 'low' ? 'success' : 'info',
  created_at: item.created_at,
  created_by: item.created_by_name || 'Admin',
});

export const useAdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    usersByRole: { admin: 0, alumni: 0, student: 0 },
    newSignups30Days: 0,
    activeMentorships: 0,
    totalJobsPosted: 0,
    usersByDepartment: {},
  });
  const [users, setUsers] = useState<UserData[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [overseasJobs, setOverseasJobs] = useState<OverseasJob[]>([]);
  const [events, setEvents] = useState<EventForApproval[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [statsRes, usersRes, announcementsRes, jobsRes, eventsRes] = await Promise.all([
        getAdminStats(),
        getAdminUsers(),
        getAnnouncements(),
        getOverseasJobs(),
        getEvents(true),
      ]);

      setStats(mapStats(statsRes));
      setUsers(usersRes.map(mapUser));
      setAnnouncements(announcementsRes.map(mapAnnouncement));
      setOverseasJobs(jobsRes.map(mapOverseasJob));
      setEvents(eventsRes.map(mapEvent));
    } catch (err: any) {
      setError(err.message || 'Failed to fetch admin data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAdminData();
  }, [fetchAdminData]);

  const verifyUser = async (userId: string, status: 'verified' | 'rejected') => {
    try {
      await verifyUserApi(userId, status);
      await fetchAdminData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deactivateUser = async (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) return;
    try {
      await deactivateUserApi(userId, !user.is_active);
      await fetchAdminData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      await deleteUserApi(userId);
      await fetchAdminData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const searchUsers = async (query: string) => {
    try {
      const results = await getAdminUsers(query);
      setUsers(results.map(mapUser));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filterByVerificationStatus = async (status: string) => {
    try {
      const results = await getAdminUsers(undefined, status);
      setUsers(results.map(mapUser));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const createAnnouncementPost = async (
    announcement: Omit<Announcement, 'id' | 'created_at' | 'created_by'>
  ) => {
    try {
      await createAnnouncement({
        title: announcement.title,
        content: announcement.content,
        type: announcement.type,
      });
      await fetchAdminData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const createOverseasJobPost = async (job: Omit<OverseasJob, 'id' | 'is_official'>) => {
    try {
      await createOverseasJob({
        title: job.title,
        company: job.company,
        country: job.country,
        description: job.description,
        requirements: job.requirements,
        salary_range: job.salary_range,
        status: job.status,
      });
      await fetchAdminData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const approveEvent = async (eventId: string, status: 'approved' | 'rejected') => {
    try {
      await updateEventStatus(eventId, status);
      await fetchAdminData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  return {
    stats,
    users,
    announcements,
    overseasJobs,
    events,
    loading,
    error,
    verifyUser,
    deactivateUser,
    deleteUser,
    searchUsers,
    filterByVerificationStatus,
    createAnnouncement: createAnnouncementPost,
    createOverseasJob: createOverseasJobPost,
    approveEvent,
    refetch: fetchAdminData,
  };
};
