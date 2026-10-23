import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  User, 
  Mail, 
  Share2, 
  Bookmark, 
  CheckCircle2, 
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  Info
} from 'lucide-react';
import { eventService } from '../../services/eventService';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Badge } from '../../components/common/Badge';
import { Card } from '../../components/common/Card';
import { Modal } from '../../components/common/Modal';
import { EventCard } from '../../components/events/EventCard';

export const EventDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [event, setEvent] = useState(null);
  const [relatedEvents, setRelatedEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isRegistered, setIsRegistered] = useState(false);
  const [existingBooking, setExistingBooking] = useState(null);

  // Registration modal
  const [modalOpen, setModalOpen] = useState(false);
  const [ticketType, setTicketType] = useState('Standard Student Pass');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchEvent = async () => {
      setLoading(true);
      try {
        const data = await eventService.getEventById(id);
        setEvent(data);

        // Fetch related events
        const all = await eventService.getEvents({ category: data.category });
        setRelatedEvents(all.filter((e) => e.id !== data.id).slice(0, 3));

        // Check user booking status
        if (currentUser?.id) {
          const userBookings = await bookingService.getBookings({ userId: currentUser.id });
          const found = userBookings.find(
            (b) => b.eventId === data.id && b.status !== 'Cancelled'
          );
          if (found) {
            setIsRegistered(true);
            setExistingBooking(found);
          } else {
            setIsRegistered(false);
            setExistingBooking(null);
          }
        }
      } catch (err) {
        showToast({
          title: 'Event Not Found',
          message: 'The requested campus event could not be retrieved.',
          type: 'error',
        });
        navigate('/events');
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id, currentUser?.id, navigate, showToast]);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      showToast({
        title: 'Sign In Required',
        message: 'Please sign in or register to attend campus events.',
        type: 'warning',
      });
      navigate('/login');
      return;
    }

    setSubmitting(true);
    try {
      const newBooking = await bookingService.createBooking({
        eventId: event.id,
        ticketType,
        notes,
      });

      setIsRegistered(true);
      setExistingBooking(newBooking);
      setModalOpen(false);

      // update event registered count locally
      setEvent((prev) => ({
        ...prev,
        registeredCount: (prev.registeredCount || 0) + 1,
      }));

      showToast({
        title: 'Registration Successful',
        message: `You are confirmed for "${event.title}". Access pass generated.`,
        type: 'success',
      });
    } catch (err) {
      showToast({
        title: 'Registration Error',
        message: err.message,
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 space-y-6 animate-pulse">
        <div className="h-8 bg-slate-200 dark:bg-white/5 rounded w-1/4" />
        <div className="h-72 bg-slate-200 dark:bg-white/5 rounded-3xl" />
        <div className="h-10 bg-slate-200 dark:bg-white/5 rounded w-3/4" />
      </div>
    );
  }

  if (!event) return null;

  const spotsLeft = Math.max(0, (event.capacity || 0) - (event.registeredCount || 0));
  const isFull = spotsLeft <= 0;
  const percentFilled = Math.min(100, Math.round(((event.registeredCount || 0) / (event.capacity || 1)) * 100));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Back button */}
      <Link
        to="/events"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
      >
        <ArrowLeft size={14} />
        Back to All Events
      </Link>

      {/* Main Event Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Cols: Visual Header, Overview, Description, Agenda */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Visual Header */}
          <div className="relative aspect-[21/9] sm:aspect-[16/8] w-full rounded-3xl overflow-hidden shadow-lg border border-slate-200/80 dark:border-white/10 bg-slate-900">
            <img
              src={event.coverImage}
              alt={event.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
            <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
              <Badge variant="primary" size="md" className="backdrop-blur-md bg-white/90 dark:bg-black/70 shadow-xs">
                {event.category}
              </Badge>
              {isRegistered && (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500 text-white shadow-md">
                  <CheckCircle2 size={14} />
                  You're Registered
                </span>
              )}
            </div>
          </div>

          {/* Title & Short Description */}
          <div className="space-y-3">
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-tight">
              {event.title}
            </h1>
            <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Detailed Full Description */}
          <div className="space-y-4 pt-4 border-t border-slate-200/80 dark:border-white/5">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
              About This Event
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-line">
              {event.fullDescription || event.description}
            </p>
          </div>

          {/* Agenda Timeline (if available) */}
          {event.agenda && event.agenda.length > 0 && (
            <div className="space-y-4 pt-4 border-t border-slate-200/80 dark:border-white/5">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                Event Schedule & Agenda
              </h2>
              <div className="space-y-3">
                {event.agenda.map((slot, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-4 p-3.5 rounded-2xl bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-white/5"
                  >
                    <span className="text-xs font-semibold text-blue-500 whitespace-nowrap bg-blue-50 dark:bg-blue-950/40 px-2.5 py-1 rounded-lg">
                      {slot.time}
                    </span>
                    <span className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium pt-0.5">
                      {slot.title}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Prerequisites & Requirements */}
          {event.prerequisites && (
            <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/20 border border-blue-200/60 dark:border-blue-900/30 flex items-start gap-3">
              <Info size={18} className="text-blue-500 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Important Notes & Prerequisites
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  {event.prerequisites}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right 1 Col: Event Meta Details Card & Action */}
        <div className="space-y-6">
          <Card className="p-6 sticky top-24 space-y-6">
            
            {/* Status & CTA Header */}
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Admission Status
              </span>
              <div className="mt-1 flex items-baseline justify-between">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">
                  Free Student Pass
                </span>
                <span className="text-xs text-emerald-500 font-medium">Verified Active</span>
              </div>
            </div>

            {/* Capacity Meter */}
            <div className="space-y-2 pt-4 border-t border-slate-100 dark:border-white/5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500 dark:text-slate-400">Seating Capacity</span>
                <span className="text-slate-800 dark:text-slate-200">
                  {event.registeredCount || 0} / {event.capacity} seats booked
                </span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    percentFilled > 90 ? 'bg-rose-500' : 'bg-blue-500'
                  }`}
                  style={{ width: `${percentFilled}%` }}
                />
              </div>
              <p className="text-[11px] text-slate-400">
                {isFull ? 'Event is at full capacity' : `${spotsLeft} seats remaining for online booking`}
              </p>
            </div>

            {/* Key Information Points */}
            <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300">
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-blue-500 shrink-0" />
                <div>
                  <span className="block text-slate-400 text-[10px] uppercase font-semibold">Date</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                    {new Date(event.date).toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'long',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Clock size={16} className="text-blue-500 shrink-0" />
                <div>
                  <span className="block text-slate-400 text-[10px] uppercase font-semibold">Time</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                    {event.startTime} - {event.endTime}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <MapPin size={16} className="text-blue-500 shrink-0" />
                <div>
                  <span className="block text-slate-400 text-[10px] uppercase font-semibold">Location / Venue</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                    {event.location}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <User size={16} className="text-blue-500 shrink-0" />
                <div>
                  <span className="block text-slate-400 text-[10px] uppercase font-semibold">Host & Organizer</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100">
                    {event.organizer}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <div className="pt-4 border-t border-slate-100 dark:border-white/5 space-y-2">
              {isRegistered ? (
                <div className="space-y-2">
                  <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40 text-emerald-800 dark:text-emerald-300 text-xs text-center font-medium">
                    You hold a confirmed pass for this event!
                  </div>
                  <Link to="/student/bookings" className="block">
                    <Button variant="secondary" size="lg" className="w-full">
                      View Booking Pass
                    </Button>
                  </Link>
                </div>
              ) : isFull ? (
                <Button variant="secondary" size="lg" disabled className="w-full">
                  Registration Closed (Full)
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => setModalOpen(true)}
                  className="w-full shadow-lg shadow-blue-500/20"
                >
                  Register for Event
                </Button>
              )}
            </div>

          </Card>
        </div>
      </div>

      {/* Related Events Carousel / Grid */}
      {relatedEvents.length > 0 && (
        <div className="space-y-6 pt-10 border-t border-slate-200/80 dark:border-white/5">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Related {event.category} Events
            </h3>
            <Link to={`/events?category=${event.category}`} className="text-xs font-semibold text-blue-500 hover:underline">
              View more in {event.category}
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedEvents.map((evt) => (
              <EventCard key={evt.id} event={evt} />
            ))}
          </div>
        </div>
      )}

      {/* Registration Modal Dialog */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="Event Registration"
        subtitle={`Booking pass for ${event.title}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleRegister} className="space-y-4">
          <div className="text-xs space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Registrant Name
            </label>
            <input
              type="text"
              readOnly
              value={currentUser?.name || ''}
              className="w-full h-10 px-3 rounded-xl bg-slate-100 dark:bg-[#1a1d28] border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-xs cursor-not-allowed"
            />
          </div>

          <div className="text-xs space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              University Email & Student ID
            </label>
            <input
              type="text"
              readOnly
              value={`${currentUser?.email || ''} (${currentUser?.studentId || 'CE-STUDENT'})`}
              className="w-full h-10 px-3 rounded-xl bg-slate-100 dark:bg-[#1a1d28] border border-slate-200 dark:border-white/10 text-slate-500 dark:text-slate-400 text-xs cursor-not-allowed"
            />
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 -mt-2">
            Verified account details are used for registration and cannot be changed here.
          </p>

          <div className="text-xs space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Ticket Tier
            </label>
            <select
              value={ticketType}
              onChange={(e) => setTicketType(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-white dark:bg-[#161821] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs"
            >
              <option value="Standard Student Pass">Standard Student Pass (Complimentary)</option>
              <option value="Reserved Front Section">Reserved Front Section</option>
              <option value="Workshop Participant Seat">Workshop Participant Seat</option>
            </select>
          </div>

          <div className="text-xs space-y-1">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Special Notes / Accessibility Requests
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="e.g. Dietary requirement, audio accommodation..."
              className="w-full p-2.5 rounded-xl bg-white dark:bg-[#161821] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs"
            />
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-end gap-2.5">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={submitting}
            >
              Confirm Reservation
            </Button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
