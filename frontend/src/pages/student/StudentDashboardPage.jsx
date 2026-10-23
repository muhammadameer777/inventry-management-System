import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Ticket, 
  Calendar, 
  Clock, 
  MapPin, 
  CheckCircle2, 
  ArrowRight, 
  Compass, 
  User, 
  Sparkles,
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { bookingService } from '../../services/bookingService';
import { eventService } from '../../services/eventService';
import { StatCard } from '../../components/dashboard/StatCard';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

export const StudentDashboardPage = () => {
  const { currentUser } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [recommendedEvents, setRecommendedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [userBookings, allEvents] = await Promise.all([
          bookingService.getBookings({ userId: currentUser?.id }),
          eventService.getEvents(),
        ]);
        setBookings(userBookings);

        const bookedEventIds = new Set(userBookings.map((b) => b.eventId));
        setRecommendedEvents(allEvents.filter((e) => !bookedEventIds.has(e.id)).slice(0, 3));
      } catch (e) {
        console.error('Failed to load student dashboard', e);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.id) {
      fetchDashboardData();
    }
  }, [currentUser?.id]);

  const confirmedBookings = bookings.filter((b) => b.status === 'Confirmed');
  const upcomingBookings = confirmedBookings.filter((b) => new Date(b.eventDate) >= new Date());

  return (
    <div className="space-y-8 pb-12">
      
      {/* 1. Stat Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Passes"
          value={confirmedBookings.length}
          subtitle="Confirmed event bookings"
          icon={Ticket}
          color="blue"
        />
        <StatCard
          title="Upcoming Events"
          value={upcomingBookings.length}
          subtitle="Scheduled on campus"
          icon={Calendar}
          color="emerald"
        />
        <StatCard
          title="Academic Units"
          value="4 Workshops"
          subtitle="Co-curricular activity"
          icon={Sparkles}
          color="indigo"
        />
        <StatCard
          title="Campus Status"
          value="Enrolled"
          subtitle="Good academic standing"
          icon={CheckCircle2}
          color="purple"
        />
      </div>

      {/* 2. Quick Actions Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/events"
          className="group p-4 rounded-2xl bg-white dark:bg-[#141414] border border-slate-200/90 dark:border-white/5 hover:border-blue-500/50 shadow-xs hover:shadow-md transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Compass size={20} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                Discover Events
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Explore symposiums & workshops
              </p>
            </div>
          </div>
          <ArrowRight size={16} className="text-slate-400 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          to="/student/bookings"
          className="group p-4 rounded-2xl bg-white dark:bg-[#141414] border border-slate-200/90 dark:border-white/5 hover:border-emerald-500/50 shadow-xs hover:shadow-md transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Ticket size={20} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                My Bookings & Passes
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                View QR codes and tickets
              </p>
            </div>
          </div>
          <ArrowRight size={16} className="text-slate-400 group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
        </Link>

        <Link
          to="/student/profile"
          className="group p-4 rounded-2xl bg-white dark:bg-[#141414] border border-slate-200/90 dark:border-white/5 hover:border-purple-500/50 shadow-xs hover:shadow-md transition-all flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-500 flex items-center justify-center group-hover:scale-105 transition-transform">
              <User size={20} />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">
                Student Profile
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Department & preferences
              </p>
            </div>
          </div>
          <ArrowRight size={16} className="text-slate-400 group-hover:text-purple-500 group-hover:translate-x-0.5 transition-all" />
        </Link>
      </div>

      {/* 3. Upcoming Registered Events Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Upcoming Registered Events
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Events you are scheduled to attend on campus.
            </p>
          </div>
          <Link
            to="/student/bookings"
            className="text-xs font-semibold text-blue-500 hover:underline flex items-center gap-1"
          >
            Manage Bookings <ArrowRight size={13} />
          </Link>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[1, 2].map((i) => (
              <div key={i} className="h-28 rounded-2xl bg-white dark:bg-[#141414] animate-pulse" />
            ))}
          </div>
        ) : upcomingBookings.length === 0 ? (
          <Card className="p-8 text-center space-y-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 flex items-center justify-center mx-auto">
              <Calendar size={18} />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              No upcoming registrations yet
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              You haven't registered for any events yet. Browse our campus catalog to find upcoming hackathons, talks, and workshops.
            </p>
            <div className="pt-2">
              <Link to="/events">
                <Button size="sm" variant="primary">
                  Browse Events
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {upcomingBookings.slice(0, 4).map((bkg) => (
              <Card key={bkg.id} className="p-4 flex gap-4 overflow-hidden">
                <img
                  src={bkg.coverImage}
                  alt={bkg.eventTitle}
                  className="w-24 h-24 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-500">
                        {bkg.eventCategory}
                      </span>
                      <Badge variant="success" size="sm">
                        {bkg.status}
                      </Badge>
                    </div>
                    <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white truncate mt-1">
                      {bkg.eventTitle}
                    </h4>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-500 dark:text-slate-400 mt-2">
                    <div className="flex items-center gap-1.5 truncate">
                      <Calendar size={12} className="text-blue-500 shrink-0" />
                      <span>{bkg.eventDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin size={12} className="text-slate-400 shrink-0" />
                      <span className="truncate">{bkg.eventLocation}</span>
                    </div>
                  </div>

                  <div className="mt-3 flex items-center justify-between text-xs pt-2 border-t border-slate-100 dark:border-white/5">
                    <span className="font-mono text-[10px] text-slate-400">
                      {bkg.referenceCode}
                    </span>
                    <Link
                      to="/student/bookings"
                      className="font-semibold text-blue-500 hover:underline flex items-center gap-1 text-[11px]"
                    >
                      View Pass <ArrowRight size={11} />
                    </Link>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* 4. Recommended Events to Attend */}
      {recommendedEvents.length > 0 && (
        <div className="space-y-4 pt-6 border-t border-slate-200/80 dark:border-white/5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
                Recommended For You
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Popular campus events with open seating.
              </p>
            </div>
            <Link
              to="/events"
              className="text-xs font-semibold text-blue-500 hover:underline flex items-center gap-1"
            >
              Browse All <ArrowRight size={13} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendedEvents.map((evt) => (
              <Card key={evt.id} className="p-4 space-y-3 flex flex-col justify-between">
                <div>
                  <img
                    src={evt.coverImage}
                    alt={evt.title}
                    className="w-full h-32 rounded-xl object-cover"
                  />
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-[10px] font-semibold uppercase text-blue-500">
                      {evt.category}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {evt.date}
                    </span>
                  </div>
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 mt-1">
                    {evt.title}
                  </h4>
                </div>

                <Link to={`/events/${evt.id}`}>
                  <Button variant="secondary" size="sm" className="w-full">
                    View Details
                  </Button>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
