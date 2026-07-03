import { useState, useEffect, useCallback } from 'react';
import { getAlumni, updateMentorStatus } from '../services/alumniService';
import {
  getMentorshipRequests,
  updateRequestStatus,
  MentorshipStatus,
} from '../services/mentorshipService';
import { getMyJobs, createJob, updateJobStatus } from '../services/jobService';
import { useAuth } from '../context/AuthContext';

export interface Mentee {
  id: string;
  studentId: string;
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

const mapMentee = (req: any): Mentee => ({
  id: req.id,
  studentId: req.student_id,
  name: req.student_name || 'Student',
  email: req.student_email || '',
  department: req.student_department || 'N/A',
  graduation_year: new Date().getFullYear(),
  status: req.status === 'accepted' ? 'active' : 'pending',
  requestMessage: req.message,
  requestDate: req.created_at,
});

const mapJob = (job: any): Job => ({
  id: job.id,
  title: job.title,
  company: job.company,
  location: job.location,
  type: job.job_type,
  description: job.description,
  requirements: job.requirements || [],
  applyLink: job.apply_link,
  postedDate: job.created_at,
  applicationCount: 0,
  status: job.status,
});

const mapPeer = (item: any): PeerAlumni => ({
  id: item.id,
  name: item.full_name,
  email: item.email,
  graduationYear: item.profile?.graduation_year || 0,
  currentCompany: item.profile?.current_company || 'N/A',
  currentPosition: item.profile?.current_position || 'N/A',
  industry: item.profile?.department || 'General',
  location: item.profile?.department || 'N/A',
});

export const useAlumniManagement = () => {
  const { user } = useAuth();
  const [mentees, setMentees] = useState<Mentee[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [peerAlumni, setPeerAlumni] = useState<PeerAlumni[]>([]);
  const [stats, setStats] = useState<AlumniStats>({
    activeMentees: 0,
    pendingRequests: 0,
    totalJobsPosted: 0,
    activeJobs: 0,
  });
  const [isMentor, setIsMentor] = useState(user?.profile?.is_mentor ?? false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const recalcStats = (menteeList: Mentee[], jobList: Job[]) => {
    setStats({
      activeMentees: menteeList.filter((m) => m.status === 'active').length,
      pendingRequests: menteeList.filter((m) => m.status === 'pending').length,
      totalJobsPosted: jobList.length,
      activeJobs: jobList.filter((j) => j.status === 'active').length,
    });
  };

  const fetchAlumniData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [requestsRes, jobsRes, peersRes] = await Promise.all([
        getMentorshipRequests(),
        getMyJobs(),
        getAlumni({ limit: 50 }),
      ]);

      const menteeList = requestsRes
        .filter((r) => r.status !== MentorshipStatus.REJECTED)
        .map(mapMentee);
      const jobList = jobsRes.map(mapJob);
      const peers = peersRes.results
        .filter((p) => p.id !== user?.id)
        .map(mapPeer);

      setMentees(menteeList);
      setJobs(jobList);
      setPeerAlumni(peers);
      recalcStats(menteeList, jobList);
      setIsMentor(user?.profile?.is_mentor ?? false);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch alumni data');
    } finally {
      setLoading(false);
    }
  }, [user?.id, user?.profile?.is_mentor]);

  useEffect(() => {
    fetchAlumniData();
  }, [fetchAlumniData]);

  const handleMentorshipRequest = async (requestId: string, action: 'accept' | 'decline') => {
    try {
      if (action === 'accept') {
        await updateRequestStatus(requestId, MentorshipStatus.ACCEPTED);
      } else {
        await updateRequestStatus(requestId, MentorshipStatus.REJECTED);
      }
      await fetchAlumniData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const createJobPost = async (
    jobData: Omit<Job, 'id' | 'postedDate' | 'applicationCount' | 'status'>
  ) => {
    try {
      await createJob({
        title: jobData.title,
        company: jobData.company,
        location: jobData.location,
        job_type: jobData.type,
        description: jobData.description,
        requirements: jobData.requirements,
        apply_link: jobData.applyLink,
      });
      await fetchAlumniData();
    } catch (err: any) {
      setError(err.message);
      throw err;
    }
  };

  const toggleJobStatus = async (jobId: string) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;
    const newStatus = job.status === 'active' ? 'closed' : 'active';
    try {
      await updateJobStatus(jobId, newStatus);
      await fetchAlumniData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const toggleMentorStatus = async () => {
    const newStatus = !isMentor;
    try {
      await updateMentorStatus(newStatus);
      setIsMentor(newStatus);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const searchPeers = async (query: string) => {
    try {
      const response = await getAlumni({
        search: query.trim() || undefined,
        limit: 50,
      });
      setPeerAlumni(
        response.results.filter((p) => p.id !== user?.id).map(mapPeer)
      );
    } catch (err: any) {
      setError(err.message);
    }
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
    createJob: createJobPost,
    toggleJobStatus,
    toggleMentorStatus,
    searchPeers,
    refetch: fetchAlumniData,
  };
};
