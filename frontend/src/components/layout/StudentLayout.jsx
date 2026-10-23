import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LayoutDashboard, Ticket, User, ClipboardList, PlusCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const StudentLayout = () => {
  const { currentUser } = useAuth();

  const navItems = [
    { label: 'Dashboard', to: '/dashboard', icon: LayoutDashboard, end: true },
    { label: 'My Bookings', to: '/my-bookings', icon: Ticket },
    { label: 'My Requests', to: '/my-requests', icon: ClipboardList },
    { label: 'Request Event', to: '/request-event', icon: PlusCircle },
    { label: 'Profile', to: '/profile', icon: User },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-200/80 dark:border-white/5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">
              {currentUser?.role === 'ORGANIZER' ? 'Organizer Portal' : 'My Account'}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome back, {currentUser?.name?.split(' ')[0] || 'there'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            {currentUser?.organization || currentUser?.email}
          </p>
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-4 mb-8 scrollbar-none">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all duration-200 ${
                  isActive
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white dark:bg-white/[0.04] text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-white/10'
                }`
              }
            >
              <Icon size={14} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </div>

      <Outlet />
    </div>
  );
};
