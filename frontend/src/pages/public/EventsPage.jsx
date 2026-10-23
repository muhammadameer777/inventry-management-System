import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, Search, SlidersHorizontal, AlertCircle, CheckCircle2 } from 'lucide-react';
import { eventService } from '../../services/eventService';
import { categoryService } from '../../services/categoryService';
import { bookingService } from '../../services/bookingService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { EventCard } from '../../components/events/EventCard';
import { EventFilters } from '../../components/events/EventFilters';
import { Modal } from '../../components/common/Modal';
import { Button } from '../../components/common/Button';

export const EventsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter state
  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  const [category, setCategory] = useState(() => searchParams.get('category') || 'all');
  const [sort, setSort] = useState('date-asc');
  const [date, setDate] = useState(() => searchParams.get('date') || '');

  // Registered Event IDs for the logged-in student
  const [registeredEventIds, setRegisteredEventIds] = useState(new Set());

  // Registration modal state
  const [registerModalOpen, setRegisterModalOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [ticketType, setTicketType] = useState('General Student Admission');
  const [notes, setNotes] = useState('');
  const [submittingBooking, setSubmittingBooking] = useState(false);

  const { currentUser, isAuthenticated, isStudent } = useAuth();
  const { showToast } = useToast();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [eventsData, categoriesData] = await Promise.all([
        eventService.getEvents({ search, category, sort, date }),
        categoryService.getCategories(),
      ]);
      setEvents(eventsData);
      setCategories(categoriesData);

      if (currentUser?.id) {
        const userBookings = await bookingService.getBookings({ userId: currentUser.id });
        const registered = new Set(
          userBookings.filter((b) => b.status !== 'Cancelled').map((b) => b.eventId)
        );
        setRegisteredEventIds(registered);
      }
    } catch (err) {
      showToast({
        title: 'Error loading events',
        message: err.message,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [search, category, sort, date, currentUser?.id, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleResetFilters = () => {
    setSearch('');
    setCategory('all');
    setSort('date-asc');
    setDate('');
    setSearchParams({});
  };

  const updateSearchParams = (nextValues) => {
    const params = new URLSearchParams();
    const nextSearch = nextValues.search ?? search;
    const nextCategory = nextValues.category ?? category;
    const nextDate = nextValues.date ?? date;
    if (nextSearch.trim()) params.set('search', nextSearch.trim());
    if (nextCategory && nextCategory !== 'all') params.set('category', nextCategory);
    if (nextDate) params.set('date', nextDate);
    setSearchParams(params, { replace: true });
  };

  const handleOpenRegisterModal = (event) => {
    if (!isAuthenticated) {
      showToast({
        title: 'Sign In Required',
        message: 'Please sign in or register to book campus event tickets.',
        type: 'warning',
      });
      return;
    }
    setSelectedEvent(event);
    setTicketType('General Student Admission');
    setNotes('');
    setRegisterModalOpen(true);
  };

  const handleConfirmRegistration = async (e) => {
    e.preventDefault();
    if (!selectedEvent || !currentUser) return;

    setSubmittingBooking(true);
    try {
      await bookingService.createBooking({
        eventId: selectedEvent.id,
        ticketType,
        notes,
      });

      showToast({
        title: 'Registration Confirmed!',
        message: `Your booking for "${selectedEvent.title}" has been saved.`,
        type: 'success',
      });

      setRegisterModalOpen(false);
      loadData(); // refresh counts and registration status
    } catch (err) {
      showToast({
        title: 'Unable to Complete Booking',
        message: err.message,
        type: 'error',
      });
    } finally {
      setSubmittingBooking(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Page Heading */}
      <div className="border-b border-slate-200/80 dark:border-white/5 pb-6">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          University Events Discovery
        </h1>
        <p className="mt-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
          Browse upcoming academic conferences, career networking summits, technology hackathons, and student society galas across the campus.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <EventFilters
        search={search}
        setSearch={(value) => {
          setSearch(value);
          updateSearchParams({ search: value });
        }}
        category={category}
        setCategory={(cat) => {
          setCategory(cat);
          updateSearchParams({ category: cat });
        }}
        sort={sort}
        setSort={setSort}
        date={date}
        setDate={(value) => {
          setDate(value);
          updateSearchParams({ date: value });
        }}
        categories={categories}
        onReset={handleResetFilters}
      />

      {/* Events Grid or States */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-96 rounded-2xl bg-white dark:bg-[#141414] border border-slate-200 dark:border-white/5 animate-pulse p-4 space-y-4"
            >
              <div className="h-44 bg-slate-200 dark:bg-white/5 rounded-xl" />
              <div className="h-4 bg-slate-200 dark:bg-white/5 rounded w-3/4" />
              <div className="h-3 bg-slate-200 dark:bg-white/5 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="text-center py-16 px-4 rounded-3xl bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-white/5">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-400 flex items-center justify-center mx-auto mb-4">
            <AlertCircle size={22} />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            No events match your criteria
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-md mx-auto">
            Try adjusting your search query, clearing date constraints, or switching categories.
          </p>
          <div className="mt-6">
            <Button variant="secondary" size="sm" onClick={handleResetFilters}>
              Clear All Filters
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((evt) => (
            <EventCard
              key={evt.id}
              event={evt}
              isRegistered={registeredEventIds.has(evt.id)}
              onRegisterClick={handleOpenRegisterModal}
            />
          ))}
        </div>
      )}

      {/* Registration Modal Dialog */}
      <Modal
        isOpen={registerModalOpen}
        onClose={() => setRegisterModalOpen(false)}
        title="Event Registration"
        subtitle="Reserve your seat with verified student credentials"
        maxWidth="max-w-lg"
      >
        {selectedEvent && (
          <form onSubmit={handleConfirmRegistration} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#1a1d28] border border-slate-200 dark:border-white/10 flex items-start gap-3">
              <img
                src={selectedEvent.coverImage}
                alt={selectedEvent.title}
                className="w-16 h-16 rounded-xl object-cover shrink-0"
              />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-500">
                  {selectedEvent.category}
                </span>
                <h4 className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {selectedEvent.title}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {selectedEvent.date} • {selectedEvent.startTime}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {selectedEvent.location}
                </p>
              </div>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Ticket / Admission Tier
              </label>
              <select
                value={ticketType}
                onChange={(e) => setTicketType(e.target.value)}
                className="w-full h-10 px-3 rounded-xl bg-white dark:bg-[#161821] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs"
              >
                <option value="General Student Admission">General Student Admission (Complimentary)</option>
                <option value="Lab Workstation Reserved Pass">Lab Workstation Reserved Pass</option>
                <option value="VIP Priority Seating">VIP Priority Seating</option>
              </select>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Special Requests or Dietary Requirements (Optional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                placeholder="e.g. Vegetarian lunch, wheelchair accessible row, laptop desk..."
                className="w-full p-2.5 rounded-xl bg-white dark:bg-[#161821] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 text-xs"
              />
            </div>

            <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-end gap-2.5">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setRegisterModalOpen(false)}
                disabled={submittingBooking}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={submittingBooking}
              >
                Confirm Registration
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </div>
  );
};
