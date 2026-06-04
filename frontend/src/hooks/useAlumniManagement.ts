import { useState, useEffect } from 'react';

export interface Mentee {
  id: string;
  name: string;
  email: string;
  department: string;
  graduation_year: number;
  status: 'pending' | 'active';
  requestMessage?: string;
  requestDate: string;
}

export interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'internship' | 'contract';
  description: string;
  requirements: string[];
  applyLink: string;
  postedDate: string;
  applicationCount: number;
  status: 'active' | 'closed';
}

export interface PeerAlumni {
  id: string;
  name: string;
  email: string;
  graduationYear: number;
  currentCompany: string;
  currentPosition: string;
  industry: string;
  location: string;
  linkedIn?: string;
}

export interface AlumniStats {
  activeMentees: number;
  pendingRequests: number;
  totalJobsPosted: number;
  activeJobs: number;
}

export const useAlumniManagement = () => {
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [peerAlumni, setPeerAlumni] = useState<PeerAlumni[]>([]);
  const [stats, setStats] = useState<AlumniStats>({
    activeMentees: 0,
    pendingRequests: 0,
    totalJobsPosted: 0,
    activeJobs: 0,
  });
  const [isMentor, setIsMentor] = useState(true);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Dummy data for presentation
  const dummyMentees: Mentee[] = [
    {
      id: '1',
      name: 'Alex Thompson',
      email: 'alex.t@university.edu',
      department: 'Computer Science',
      graduation_year: 2026,
      status: 'pending',
      requestMessage: 'Hi! I\'m very interested in learning about software engineering at TechCorp. I\'d love to hear about your career journey and get guidance on preparing for technical interviews.',
      requestDate: '2026-01-05',
    },
    {
      id: '2',
      name: 'Maya Patel',
      email: 'maya.p@university.edu',
      department: 'Computer Science',
      graduation_year: 2027,
      status: 'active',
      requestDate: '2025-12-15',
    },
    {
      id: '3',
      name: 'James Wilson',
      email: 'james.w@university.edu',
      department: 'Data Science',
      graduation_year: 2026,
      status: 'pending',
      requestMessage: 'I\'m looking to transition from data analysis to machine learning engineering. Your experience would be incredibly valuable to me.',
      requestDate: '2026-01-04',
    },
    {
      id: '4',
      name: 'Sophie Chen',
      email: 'sophie.c@university.edu',
      department: 'Computer Science',
      graduation_year: 2026,
      status: 'active',
      requestDate: '2025-12-20',
    },
  ];

  const dummyJobs: Job[] = [
    {
      id: '1',
      title: 'Frontend Developer',
      company: 'TechCorp',
      location: 'San Francisco, CA',
      type: 'full-time',
      description: 'Join our team building next-generation web applications. We\'re looking for passionate developers with strong React skills.',
      requirements: ['React', 'TypeScript', 'REST APIs', '3+ years experience'],
      applyLink: 'https://techcorp.com/careers/frontend-dev',
      postedDate: '2026-01-03',
      applicationCount: 12,
      status: 'active',
    },
    {
      id: '2',
      title: 'Software Engineering Intern',
      company: 'TechCorp',
      location: 'Remote',
      type: 'internship',
      description: 'Summer 2026 internship program for talented CS students. Work on real projects with mentorship.',
      requirements: ['Python or JavaScript', 'Data Structures', 'Problem Solving'],
      applyLink: 'https://techcorp.com/careers/intern',
      postedDate: '2025-12-28',
      applicationCount: 25,
      status: 'active',
    },
    {
      id: '3',
      title: 'Senior Backend Engineer',
      company: 'TechCorp',
      location: 'San Francisco, CA',
      type: 'full-time',
      description: 'Lead backend architecture and mentor junior engineers.',
      requirements: ['Python', 'PostgreSQL', 'AWS', '5+ years experience'],
      applyLink: 'https://techcorp.com/careers/senior-backend',
      postedDate: '2025-12-15',
      applicationCount: 8,
      status: 'closed',
    },
  ];

  const dummyPeerAlumni: PeerAlumni[] = [
    {
      id: '1',
      name: 'Michael Chen',
      email: 'mchen@dataanalytics.com',
      graduationYear: 2019,
      currentCompany: 'DataAnalytics Inc',
      currentPosition: 'Lead Data Scientist',
      industry: 'Data Science',
      location: 'New York, NY',
      linkedIn: 'linkedin.com/in/michael-chen',
    },
    {
      id: '2',
      name: 'Emily Rodriguez',
      email: 'emily.r@fintech.com',
      graduationYear: 2020,
      currentCompany: 'FinTech Solutions',
      currentPosition: 'Senior Product Manager',
      industry: 'Financial Technology',
      location: 'Boston, MA',
      linkedIn: 'linkedin.com/in/emily-rodriguez',
    },
    {
      id: '3',
      name: 'David Park',
      email: 'dpark@cloudservices.com',
      graduationYear: 2017,
      currentCompany: 'Cloud Services Corp',
      currentPosition: 'DevOps Engineer',
      industry: 'Cloud Computing',
      location: 'Seattle, WA',
      linkedIn: 'linkedin.com/in/david-park',
    },
    {
      id: '4',
      name: 'Jennifer Lee',
      email: 'jlee@designstudio.com',
      graduationYear: 2019,
      currentCompany: 'Design Studio',
      currentPosition: 'Senior UX Designer',
      industry: 'Design',
      location: 'Austin, TX',
      linkedIn: 'linkedin.com/in/jennifer-lee',
    },
    {
      id: '5',
      name: 'Robert Martinez',
      email: 'rmartinez@securityfirm.com',
      graduationYear: 2018,
      currentCompany: 'SecureNet',
      currentPosition: 'Security Engineer',
      industry: 'Cybersecurity',
      location: 'Washington, DC',
      linkedIn: 'linkedin.com/in/robert-martinez',
    },
  ];

  useEffect(() => {
    fetchAlumniData();
  }, []);

  const fetchAlumniData = async () => {
    setLoading(true);
    try {
      // Demo mode: Use dummy data
      // In production, uncomment:
      // const [menteesRes, jobsRes, peersRes] = await Promise.all([
      //   apiClient.get('/mentorship/mentees'),
      //   apiClient.get('/jobs/my-jobs'),
      //   apiClient.get('/alumni/peers'),
      // ]);
      
      setTimeout(() => {
        setMentees(dummyMentees);
        setJobs(dummyJobs);
        setPeerAlumni(dummyPeerAlumni);
        
        // Calculate stats
        const activeMentees = dummyMentees.filter(m => m.status === 'active').length;
        const pendingRequests = dummyMentees.filter(m => m.status === 'pending').length;
        const activeJobs = dummyJobs.filter(j => j.status === 'active').length;
        
        setStats({
          activeMentees,
          pendingRequests,
          totalJobsPosted: dummyJobs.length,
          activeJobs,
        });
        
        setLoading(false);
      }, 800);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch alumni data');
      setLoading(false);
    }
  };

  const handleMentorshipRequest = async (requestId: string, action: 'accept' | 'decline') => {
    // Demo mode: Update locally
    setMentees(prevMentees => 
      prevMentees.map(mentee => 
        mentee.id === requestId 
          ? { ...mentee, status: (action === 'accept' ? 'active' : 'pending') as 'active' | 'pending' }
          : mentee
      ).filter(mentee => !(mentee.id === requestId && action === 'decline'))
    );

    // Update stats
    setStats(prev => ({
      ...prev,
      activeMentees: action === 'accept' ? prev.activeMentees + 1 : prev.activeMentees,
      pendingRequests: prev.pendingRequests - 1,
    }));

    // Production mode:
    // await apiClient.patch(`/mentorship-requests/${requestId}`, { status: action === 'accept' ? 'accepted' : 'declined' });
    // fetchAlumniData();
  };

  const createJob = async (jobData: Omit<Job, 'id' | 'postedDate' | 'applicationCount' | 'status'>) => {
    const newJob: Job = {
      ...jobData,
      id: Date.now().toString(),
      postedDate: new Date().toISOString().split('T')[0],
      applicationCount: 0,
      status: 'active',
    };

    setJobs(prev => [newJob, ...prev]);
    setStats(prev => ({
      ...prev,
      totalJobsPosted: prev.totalJobsPosted + 1,
      activeJobs: prev.activeJobs + 1,
    }));

    // Production mode:
    // await apiClient.post('/jobs', jobData);
    // fetchAlumniData();
  };

  const toggleJobStatus = (jobId: string) => {
    setJobs(prev => 
      prev.map(job => 
        job.id === jobId 
          ? { ...job, status: job.status === 'active' ? 'closed' : 'active' }
          : job
      )
    );

    // Production mode:
    // await apiClient.patch(`/jobs/${jobId}/status`);
  };

  const toggleMentorStatus = async () => {
    setIsMentor(!isMentor);
    
    // Production mode:
    // await apiClient.patch('/alumni/status', { is_mentor: !isMentor });
  };

  const searchPeers = (query: string) => {
    if (!query.trim()) {
      setPeerAlumni(dummyPeerAlumni);
      return;
    }

    const filtered = dummyPeerAlumni.filter(peer =>
      peer.name.toLowerCase().includes(query.toLowerCase()) ||
      peer.industry.toLowerCase().includes(query.toLowerCase()) ||
      peer.currentCompany.toLowerCase().includes(query.toLowerCase()) ||
      peer.graduationYear.toString().includes(query)
    );

    setPeerAlumni(filtered);

    // Production mode:
    // const response = await apiClient.get(`/alumni/peers?search=${query}`);
    // setPeerAlumni(response.data);
  };

  return {
    mentees,
    jobs,
    peerAlumni,
    stats,
    isMentor,
    loading,
    error,
    handleMentorshipRequest,
    createJob,
    toggleJobStatus,
    toggleMentorStatus,
    searchPeers,
    refetch: fetchAlumniData,
  };
};
