import { useState, useEffect, useCallback } from 'react';
import { getAlumni } from '../services/alumniService';
import { getJobs } from '../services/jobService';
import { getEvents, toggleEventRsvp } from '../services/eventService';
import { getAnnouncements } from '../services/announcementService';
import { getMentorshipRequests, MentorshipStatus } from '../services/mentorshipService';

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
  applyLink?: string;
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

const mapAlumni = (item: any): Alumni => ({
  id: item.id,
  name: item.full_name,
  email: item.email,
  profile: {
    bio: item.profile?.bio,
    department: item.profile?.department,
    graduation_year: item.profile?.graduation_year,
    company: item.profile?.current_company,
    position: item.profile?.current_position,
    skills: item.profile?.mentorship_expertise || [],
    is_mentor: item.profile?.is_mentor,
  },
});

const mapJob = (job: any): Job => ({
  id: job.id,
  title: job.title,
  company: job.company,
  location: job.location,
  type: job.category === 'external' ? 'external' : 'internal',
  skills: job.requirements || [],
  description: job.description,
  postedBy: job.posted_by_name || 'Alumni',
  postedDate: job.created_at,
  applyLink: job.apply_link,
  saved: false,
});

const mapEvent = (event: any): Event => ({
  id: event.id,
  title: event.title,
  date: event.event_date,
  time: event.event_time,
  location: event.location,
  description: event.description || '',
  organizer: event.organizer_name || 'Organizer',
  attendees: event.attendees,
  isRSVPed: event.is_rsvped,
});

const mapAnnouncement = (item: any): Announcement => ({
  id: item.id,
  title: item.title,
  message: item.content,
  priority: item.priority,
  date: item.created_at,
});

export const useStudentDashboard = () => {
  const [alumni, setAlumni] = useState<Alumni[]>([]);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [activeMentorships, setActiveMentorships] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [alumniRes, jobsRes, eventsRes, announcementsRes, mentorshipRes] = await Promise.all([
        getAlumni({ is_mentor: true, limit: 20 }),
        getJobs(),
        getEvents(),
        getAnnouncements(),
        getMentorshipRequests(MentorshipStatus.ACCEPTED),
      ]);

      setAlumni(alumniRes.results.map(mapAlumni));
      setJobs(jobsRes.map(mapJob));
      setEvents(eventsRes.map(mapEvent));
      setAnnouncements(announcementsRes.map(mapAnnouncement));
      setActiveMentorships(mentorshipRes.length);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch dashboard data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const searchAlumni = async (query: string) => {
    try {
      const response = await getAlumni({
        search: query.trim() || undefined,
        is_mentor: true,
        limit: 20,
      });
      setAlumni(response.results.map(mapAlumni));
    } catch (err: any) {
      setError(err.message);
    }
  };

  const toggleSaveJob = (jobId: string) => {
    setJobs((prevJobs) =>
      prevJobs.map((job) => (job.id === jobId ? { ...job, saved: !job.saved } : job))
    );
  };

  const toggleRSVP = async (eventId: string) => {
    try {
      const updated = await toggleEventRsvp(eventId);
      setEvents((prevEvents) =>
        prevEvents.map((event) =>
          event.id === eventId
            ? {
                ...event,
                isRSVPed: updated.is_rsvped,
                attendees: updated.attendees,
              }
            : event
        )
      );
    } catch (err: any) {
      setError(err.message);
    }
  };

  return {
    alumni,
    jobs,
    events,
    announcements,
    activeMentorships,
    loading,
    error,
    searchAlumni,
    toggleSaveJob,
    toggleRSVP,
    refetch: fetchDashboardData,
  };
};
