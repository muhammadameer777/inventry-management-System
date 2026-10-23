import React from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, Clock3, MapPin, Users, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { Card } from '../common/Card';

export const EventCard = ({ event, isRegistered = false, onRegisterClick, featuredLabel }) => {
  const spotsLeft = Math.max(0, (event.capacity || 0) - (event.registeredCount || 0));
  const isFull = spotsLeft <= 0;
  const percentFilled = Math.min(100, Math.round(((event.registeredCount || 0) / (event.capacity || 1)) * 100));
  const badge = featuredLabel || (event.featured ? 'Featured' : event.category);

  const formattedDate = new Date(`${event.date}T00:00:00`).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });
  const price = event.ticketPrice > 0
    ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(event.ticketPrice)
    : 'Free';

  return (
    <Card hoverEffect className="group flex h-full flex-col overflow-hidden rounded-2xl shadow-lg shadow-black/10 dark:border-white/[0.07]">
      <Link to={`/events/${event.id}`} className="relative block aspect-[16/10] overflow-hidden bg-[#1c1c1c]">
        <img
          src={event.coverImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=800'}
          alt={event.title}
          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-black/20" />
        <span className="absolute left-4 top-4 rounded-full border border-amber-300/30 bg-black/55 px-3 py-1 text-[11px] font-semibold text-amber-300 backdrop-blur-sm">
          {badge}
        </span>
        {isRegistered && (
          <span className="absolute right-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-emerald-600/90 px-3 py-1 text-[11px] font-semibold text-white">
            <CheckCircle2 size={13} />
            Registered
          </span>
        )}
        {!isRegistered && isFull && (
          <span className="absolute right-4 top-4 rounded-full bg-rose-600/90 px-3 py-1 text-[11px] font-semibold text-white">
            Fully booked
          </span>
        )}
      </Link>

      <div className="flex flex-1 flex-col p-5">
        <p className="mb-2 truncate text-xs font-medium uppercase tracking-wider text-amber-600 dark:text-amber-500">
          {event.organizer || event.category}
        </p>
        <Link to={`/events/${event.id}`} className="text-slate-900 dark:text-white">
          <h3 className="line-clamp-2 min-h-12 text-lg font-semibold leading-snug tracking-tight transition-colors group-hover:text-amber-400">
            {event.title}
          </h3>
        </Link>
        <p className="mt-2 line-clamp-2 min-h-10 text-sm leading-relaxed text-slate-500 dark:text-white/55">
          {event.description}
        </p>

        <div className="mt-5 grid grid-cols-2 gap-x-3 gap-y-3 text-xs text-slate-500 dark:text-white/65">
          <div className="flex min-w-0 items-center gap-2">
            <CalendarDays size={15} className="shrink-0 text-amber-500" />
            <span className="truncate">{formattedDate}</span>
          </div>
          <div className="flex min-w-0 items-center gap-2">
            <Clock3 size={15} className="shrink-0 text-amber-500" />
            <span className="truncate">{event.startTime}</span>
          </div>
          <div className="col-span-2 flex min-w-0 items-center gap-2">
            <MapPin size={15} className="shrink-0 text-amber-500" />
            <span className="truncate">{event.location}</span>
          </div>
        </div>

        <div className="mt-auto pt-5">
          <div className="mb-4 flex items-end justify-between gap-3 border-t border-white/[0.07] pt-4">
            <div>
              <p className="text-[11px] text-slate-500 dark:text-white/45">Admission</p>
              <p className="mt-0.5 text-lg font-bold text-slate-900 dark:text-white">{price}</p>
            </div>
            <p className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-white/55">
              <Users size={14} className="text-amber-500" />
              {isFull ? 'No places left' : `${spotsLeft} places left`}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={`/events/${event.id}`}
              className="inline-flex h-10 flex-1 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-800 transition hover:border-amber-400/40 hover:bg-amber-50 dark:border-white/10 dark:bg-white/[0.04] dark:text-white dark:hover:bg-white/[0.08]"
            >
              Details <ArrowUpRight size={15} />
            </Link>
            {isRegistered ? (
              <Link
                to="/student/bookings"
                className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-emerald-600 px-3 text-sm font-semibold text-white transition hover:bg-emerald-500"
              >
                View pass
              </Link>
            ) : (
              isFull ? (
                <button
                  type="button"
                  disabled
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-slate-100 px-3 text-sm font-semibold text-slate-400 dark:bg-white/10 dark:text-white/35"
                >
                  Fully booked
                </button>
              ) : onRegisterClick ? (
                <button
                  type="button"
                  onClick={() => onRegisterClick(event)}
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-amber-500 px-3 text-sm font-semibold text-black transition hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/20"
                >
                  Register
                </button>
              ) : (
                <Link
                  to={`/events/${event.id}`}
                  className="inline-flex h-10 flex-1 items-center justify-center rounded-xl bg-amber-500 px-3 text-sm font-semibold text-black transition hover:bg-amber-400 hover:shadow-lg hover:shadow-amber-500/20"
                >
                  Register
                </Link>
              )
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};
