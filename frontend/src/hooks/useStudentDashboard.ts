import { useState, useEffect } from 'react';

export interface Alumni {
  id: string;
  name: string;
  email: string;
  profile: {
    bio?: string;
    department?: string;
    graduation_year?: number;
    company?: string;
    position?: string;
    skills?: string[];
    is_mentor?: boolean;
  };
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'internal' | 'external';
  skills: string[];
  description: string;
  postedBy: string;
  postedDate: string;
  saved?: boolean;
}

export interface Event {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
  organizer: string;
  attendees: number;
  isRSVPed?: boolean;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  priority: 'high' | 'medium' | 'low';
  date: string;
}

export const useStudentDashboard = () => {
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dummy data for presentation
  const dummyAlumni: Alumni[] = [
    {
      id: '1',
      name: 'Sarika Polisetty',
      email: 'sarika.polisetty@techcorp.com',
      profile: {
        bio: 'Senior Software Engineer at TechCorp. Passionate about mentoring students.',
        department: 'Computer Science',
        graduation_year: 2018,
        company: 'TechCorp',
        position: 'Senior Software Engineer',
        skills: ['React', 'Python', 'AWS', 'System Design'],
        is_mentor: true,
      },
    },
    {
      id: '2',
      name: 'Michael Chen',
      email: 'mchen@dataanalytics.com',
      profile: {
        bio: 'Data Scientist helping students break into AI/ML.',
        department: 'Data Science',
        graduation_year: 2019,
        company: 'DataAnalytics Inc',
        position: 'Lead Data Scientist',
        skills: ['Python', 'TensorFlow', 'SQL', 'Machine Learning'],
        is_mentor: true,
      },
    },
    {
      id: '3',
      name: 'Emily Rodriguez',
      email: 'emily.r@fintech.com',
      profile: {
        bio: 'Product Manager at FinTech startup. Love helping students with PM career paths.',
        department: 'Business Administration',
        graduation_year: 2020,
        company: 'FinTech Solutions',
        position: 'Senior Product Manager',
        skills: ['Product Strategy', 'Agile', 'User Research', 'Analytics'],
        is_mentor: true,
      },
    },
    {
      id: '4',
      name: 'David Park',
      email: 'dpark@cloudservices.com',
      profile: {
        bio: 'DevOps Engineer specializing in cloud infrastructure.',
        department: 'Computer Engineering',
        graduation_year: 2017,
        company: 'Cloud Services Corp',
        position: 'DevOps Engineer',
        skills: ['Kubernetes', 'Docker', 'CI/CD', 'Terraform'],
        is_mentor: true,
      },
    },
    {
      id: '5',
      name: 'Jennifer Lee',
      email: 'jlee@designstudio.com',
      profile: {
        bio: 'UX Designer passionate about creating delightful user experiences.',
        department: 'Design',
        graduation_year: 2019,
        company: 'Design Studio',
        position: 'Senior UX Designer',
        skills: ['Figma', 'User Research', 'Prototyping', 'Design Systems'],
        is_mentor: true,
      },
    },
    {
      id: '6',
      name: 'Robert Martinez',
      email: 'rmartinez@securityfirm.com',
      profile: {
        bio: 'Cybersecurity specialist helping students learn security best practices.',
        department: 'Cybersecurity',
        graduation_year: 2018,
        company: 'SecureNet',
        position: 'Security Engineer',
        skills: ['Penetration Testing', 'Network Security', 'Python', 'Cryptography'],
        is_mentor: true,
      },
    },
  ];

  const dummyJobs: Job[] = [
    {
      id: '1',
      title: 'Frontend Developer',
      company: 'TechCorp',
      location: 'San Francisco, CA',
      type: 'internal',
      skills: ['React', 'TypeScript', 'CSS', 'REST APIs'],
      description: 'Join our team building next-gen web applications.',
      postedBy: 'Sarah Johnson',
      postedDate: '2026-01-03',
      saved: false,
    },
    {
      id: '2',
      title: 'Data Analyst Intern',
      company: 'DataAnalytics Inc',
      location: 'Remote',
      type: 'internal',
      skills: ['Python', 'SQL', 'Tableau', 'Statistics'],
      description: 'Summer internship analyzing business data.',
      postedBy: 'Michael Chen',
      postedDate: '2026-01-04',
      saved: false,
    },
    {
      id: '3',
      title: 'Software Engineering Intern',
      company: 'Google',
      location: 'Mountain View, CA',
      type: 'external',
      skills: ['Java', 'Algorithms', 'Data Structures', 'System Design'],
      description: 'Competitive internship program for top CS students.',
      postedBy: 'Career Services',
      postedDate: '2026-01-02',
      saved: false,
    },
    {
      id: '4',
      title: 'Product Management Intern',
      company: 'FinTech Solutions',
      location: 'New York, NY',
      type: 'internal',
      skills: ['Product Strategy', 'User Research', 'Agile', 'Communication'],
      description: 'Work on cutting-edge fintech products.',
      postedBy: 'Emily Rodriguez',
      postedDate: '2026-01-05',
      saved: false,
    },
    {
      id: '5',
      title: 'Full Stack Developer',
      company: 'Microsoft',
      location: 'Seattle, WA',
      type: 'external',
      skills: ['C#', '.NET', 'Azure', 'React'],
      description: 'Build cloud-native applications at scale.',
      postedBy: 'Career Services',
      postedDate: '2026-01-01',
      saved: false,
    },
  ];

  const dummyEvents: Event[] = [
    {
      id: '1',
      title: 'Alumni Networking Night',
      date: '2026-01-15',
      time: '6:00 PM',
      location: 'Campus Center Hall',
      description: 'Meet alumni from various industries and expand your network.',
      organizer: 'Alumni Relations',
      attendees: 45,
      isRSVPed: false,
    },
    {
      id: '2',
      title: 'Tech Career Fair 2026',
      date: '2026-01-20',
      time: '10:00 AM',
      location: 'Student Union Building',
      description: 'Top tech companies recruiting for internships and full-time positions.',
      organizer: 'Career Services',
      attendees: 120,
      isRSVPed: false,
    },
    {
      id: '3',
      title: 'Resume Workshop',
      date: '2026-01-12',
      time: '3:00 PM',
      location: 'Library Conference Room',
      description: 'Learn how to craft a compelling resume that stands out.',
      organizer: 'Career Services',
      attendees: 30,
      isRSVPed: false,
    },
    {
      id: '4',
      title: 'Startup Pitch Competition',
      date: '2026-01-25',
      time: '5:00 PM',
      location: 'Innovation Hub',
      description: 'Watch student startups pitch to venture capitalists.',
      organizer: 'Entrepreneurship Club',
      attendees: 75,
      isRSVPed: false,
    },
  ];

  const dummyAnnouncements: Announcement[] = [
    {
      id: '1',
      title: 'Spring Semester Registration Open',
      message: 'Registration for Spring 2026 is now open. Don\'t miss early registration deadlines!',
      priority: 'high',
      date: '2026-01-05',
    },
    {
      id: '2',
      title: 'New Mentorship Program Launch',
      message: 'Connect with alumni mentors in your field. Applications now open!',
      priority: 'medium',
      date: '2026-01-04',
    },
    {
      id: '3',
      title: 'Career Fair This Month',
      message: 'Mark your calendars! Tech Career Fair on January 20th.',
      priority: 'high',
      date: '2026-01-03',
    },
  ];

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      // For demo mode, use dummy data
      // In production, uncomment the API calls below
      
      // const [alumniRes, jobsRes, eventsRes, announcementsRes] = await Promise.all([
      //   apiClient.get('/alumni?limit=6'),
      //   apiClient.get('/jobs'),
      //   apiClient.get('/events'),
      //   apiClient.get('/announcements'),
      // ]);
      
      // setAlumni(alumniRes.data);
      // setJobs(jobsRes.data);
      // setEvents(eventsRes.data);
      // setAnnouncements(announcementsRes.data);

      // Demo mode: Use dummy data
      setTimeout(() => {
        setAlumni(dummyAlumni);
        setJobs(dummyJobs);
        setEvents(dummyEvents);
        setAnnouncements(dummyAnnouncements);
        setLoading(false);
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard data');
      // Fallback to dummy data on error
      setAlumni(dummyAlumni);
      setJobs(dummyJobs);
      setEvents(dummyEvents);
      setAnnouncements(dummyAnnouncements);
      setLoading(false);
    }
  };

  const searchAlumni = async (query: string) => {
    if (!query.trim()) {
      setAlumni(dummyAlumni);
      return;
    }

    // Demo mode: Filter locally
    const filtered = dummyAlumni.filter(
      (alum) =>
        alum.name.toLowerCase().includes(query.toLowerCase()) ||
        alum.profile.department?.toLowerCase().includes(query.toLowerCase()) ||
        alum.profile.skills?.some((skill) => skill.toLowerCase().includes(query.toLowerCase()))
    );
    setAlumni(filtered);

    // Production mode:
    // try {
    //   const response = await apiClient.get(`/alumni?search=${query}`);
    //   setAlumni(response.data);
    // } catch (err: any) {
    //   setError(err.message);
    // }
  };

  const toggleSaveJob = (jobId: string) => {
    setJobs((prevJobs) =>
      prevJobs.map((job) => (job.id === jobId ? { ...job, saved: !job.saved } : job))
    );
  };

  const toggleRSVP = (eventId: string) => {
    setEvents((prevEvents) =>
      prevEvents.map((event) =>
        event.id === eventId ? { ...event, isRSVPed: !event.isRSVPed, attendees: event.isRSVPed ? event.attendees - 1 : event.attendees + 1 } : event
      )
    );
  };

  return {
    alumni,
    jobs,
    events,
    announcements,
    loading,
    error,
    searchAlumni,
    toggleSaveJob,
    toggleRSVP,
    refetch: fetchDashboardData,
  };
};
