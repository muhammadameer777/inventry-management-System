import React from 'react';
import { Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="mt-auto w-full border-t border-slate-200 bg-white dark:border-white/[0.07] dark:bg-[#101010]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="space-y-3">
            <Link to="/" className="inline-flex items-center gap-2 text-slate-900 dark:text-white">
              <Calendar size={18} className="text-blue-600 dark:text-blue-400" />
              <span className="font-semibold">CampusEvents</span>
            </Link>
            <p className="max-w-xs text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Find campus events, reserve a place, and keep your bookings together.
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Events</h2>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li><Link to="/events" className="hover:text-blue-600 dark:hover:text-blue-400">Browse all events</Link></li>
              <li><Link to="/events?category=workshop" className="hover:text-blue-600 dark:hover:text-blue-400">Workshops</Link></li>
              <li><Link to="/events?category=seminar" className="hover:text-blue-600 dark:hover:text-blue-400">Seminars</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Your account</h2>
            <ul className="space-y-2 text-sm text-slate-600 dark:text-slate-400">
              <li><Link to="/login" className="hover:text-blue-600 dark:hover:text-blue-400">Sign in</Link></li>
              <li><Link to="/register" className="hover:text-blue-600 dark:hover:text-blue-400">Create an account</Link></li>
              <li><Link to="/student/bookings" className="hover:text-blue-600 dark:hover:text-blue-400">My bookings</Link></li>
            </ul>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-white mb-3">Event organisers</h2>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-400">
              Sign in to manage events and review registrations.
            </p>
            <Link to="/login" className="inline-block mt-2 text-sm font-medium text-blue-600 hover:underline dark:text-blue-400">
              Organiser sign in
            </Link>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-5 text-sm text-slate-500 dark:border-white/[0.07] dark:text-white/45">
          © {new Date().getFullYear()} CampusEvents
        </div>
      </div>
    </footer>
  );
};
