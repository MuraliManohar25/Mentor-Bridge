import { useState, useEffect } from 'react';

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

  // Dummy data for demo
  const dummyStats: AdminStats = {
    totalUsers: 1234,
    usersByRole: {
      admin: 5,
      alumni: 456,
      student: 773,
    },
    newSignups30Days: 89,
    activeMentorships: 127,
    totalJobsPosted: 342,
    usersByDepartment: {
      'Computer Science': 412,
      'Business': 287,
      'Engineering': 234,
      'Design': 156,
      'Data Science': 145,
    },
  };

  const dummyUsers: UserData[] = [
    {
      id: '1',
      full_name: 'Sarah Johnson',
      email: 'sarah.j@example.com',
      role: 'alumni',
      department: 'Computer Science',
      verification_status: 'pending',
      is_active: true,
      created_at: '2026-01-05',
    },
    {
      id: '2',
      full_name: 'Michael Chen',
      email: 'michael.c@example.com',
      role: 'student',
      department: 'Business',
      verification_status: 'verified',
      is_active: true,
      created_at: '2026-01-04',
    },
    {
      id: '3',
      full_name: 'Emily Rodriguez',
      email: 'emily.r@example.com',
      role: 'alumni',
      department: 'Engineering',
      verification_status: 'pending',
      is_active: true,
      created_at: '2026-01-03',
    },
    {
      id: '4',
      full_name: 'David Kim',
      email: 'david.k@example.com',
      role: 'student',
      department: 'Design',
      verification_status: 'verified',
      is_active: true,
      created_at: '2026-01-02',
    },
    {
      id: '5',
      full_name: 'Lisa Anderson',
      email: 'lisa.a@example.com',
      role: 'alumni',
      department: 'Mathematics',
      verification_status: 'rejected',
      is_active: false,
      created_at: '2025-12-30',
    },
  ];

  const dummyAnnouncements: Announcement[] = [
    {
      id: '1',
      title: 'System Maintenance Scheduled',
      content: 'The platform will undergo maintenance on January 10th from 2-4 AM EST.',
      type: 'warning',
      created_at: '2026-01-05',
      created_by: 'Admin',
    },
    {
      id: '2',
      title: 'New Features Released',
      content: 'Check out our new mentorship matching algorithm and improved job board!',
      type: 'success',
      created_at: '2026-01-03',
      created_by: 'Admin',
    },
  ];

  const dummyOverseasJobs: OverseasJob[] = [
    {
      id: '1',
      title: 'Senior Software Engineer',
      company: 'Tech Global Inc',
      country: 'Germany',
      description: 'Join our Berlin office to work on cutting-edge AI projects.',
      requirements: ['5+ years experience', 'Python', 'TensorFlow', 'German (B1)'],
      salary_range: '€80,000 - €120,000',
      status: 'active',
      is_official: true,
    },
    {
      id: '2',
      title: 'Product Manager',
      company: 'Innovation Labs',
      country: 'Singapore',
      description: 'Lead product development for our APAC expansion.',
      requirements: ['3+ years PM experience', 'Agile', 'Data-driven'],
      salary_range: 'SGD 100,000 - 150,000',
      status: 'active',
      is_official: true,
    },
  ];

  const dummyEvents: EventForApproval[] = [
    {
      id: '1',
      title: 'Tech Career Fair 2026',
      organizer: 'Alumni Association',
      date: '2026-01-25',
      attendees: 200,
      status: 'pending',
    },
    {
      id: '2',
      title: 'Networking Mixer',
      organizer: 'Sarah Johnson',
      date: '2026-02-05',
      attendees: 50,
      status: 'pending',
    },
  ];

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // Demo mode: Use dummy data
      // In production:
      // const response = await apiClient.get('/admin/stats');
      // setStats(response.data);
      
      setTimeout(() => {
        setStats(dummyStats);
        setUsers(dummyUsers);
        setAnnouncements(dummyAnnouncements);
        setOverseasJobs(dummyOverseasJobs);
        setEvents(dummyEvents);
        setLoading(false);
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch admin data');
      setLoading(false);
    }
  };

  const verifyUser = async (userId: string, status: 'verified' | 'rejected') => {
    // Demo mode: Update locally
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId
          ? { ...user, verification_status: status, is_active: status === 'verified' }
          : user
      )
    );

    // Update stats
    setStats(prev => ({
      ...prev,
      usersByRole: {
        ...prev.usersByRole,
      },
    }));

    // Production:
    // await apiClient.patch(`/admin/verify-user/${userId}`, { status });
    // fetchAdminData();
  };

  const deactivateUser = async (userId: string) => {
    // Demo mode: Update locally
    setUsers(prevUsers =>
      prevUsers.map(user =>
        user.id === userId ? { ...user, is_active: !user.is_active } : user
      )
    );

    // Production:
    // await apiClient.patch(`/admin/deactivate-user/${userId}`, { is_active: false });
  };

  const deleteUser = async (userId: string) => {
    // Demo mode: Remove from list
    setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
    
    // Update stats
    setStats(prev => ({
      ...prev,
      totalUsers: prev.totalUsers - 1,
    }));

    // Production:
    // await apiClient.delete(`/admin/delete-user/${userId}`);
  };

  const searchUsers = (query: string) => {
    if (!query.trim()) {
      setUsers(dummyUsers);
      return;
    }

    const filtered = dummyUsers.filter(
      user =>
        user.full_name.toLowerCase().includes(query.toLowerCase()) ||
        user.email.toLowerCase().includes(query.toLowerCase())
    );

    setUsers(filtered);
  };

  const filterByVerificationStatus = (status: string) => {
    if (status === 'all') {
      setUsers(dummyUsers);
      return;
    }

    const filtered = dummyUsers.filter(user => user.verification_status === status);
    setUsers(filtered);
  };

  const createAnnouncement = async (announcement: Omit<Announcement, 'id' | 'created_at' | 'created_by'>) => {
    const newAnnouncement: Announcement = {
      ...announcement,
      id: Date.now().toString(),
      created_at: new Date().toISOString().split('T')[0],
      created_by: 'Admin',
    };

    setAnnouncements(prev => [newAnnouncement, ...prev]);

    // Production:
    // await apiClient.post('/admin/announcements', announcement);
  };

  const createOverseasJob = async (job: Omit<OverseasJob, 'id' | 'is_official'>) => {
    const newJob: OverseasJob = {
      ...job,
      id: Date.now().toString(),
      is_official: true,
    };

    setOverseasJobs(prev => [newJob, ...prev]);

    // Production:
    // await apiClient.post('/admin/overseas-jobs', job);
  };

  const approveEvent = async (eventId: string, status: 'approved' | 'rejected') => {
    setEvents(prevEvents =>
      prevEvents.map(event =>
        event.id === eventId ? { ...event, status } : event
      )
    );

    // Production:
    // await apiClient.patch(`/admin/events/${eventId}`, { status });
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
    createAnnouncement,
    createOverseasJob,
    approveEvent,
    refetch: fetchAdminData,
  };
};
