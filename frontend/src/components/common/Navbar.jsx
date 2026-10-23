import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Sun, 
  Moon, 
  User, 
  ShieldCheck, 
  Menu, 
  X, 
  LogOut, 
  ChevronDown, 
  Compass, 
  Bookmark, 
  Layers,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from './Button';

export const Navbar = () => {
  const { isDark, toggleTheme } = useTheme();
  const { currentUser, isAuthenticated, isAdmin, logout } = useAuth();
  const isStudent = currentUser?.role === 'USER';
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-nav transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo / Brand */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center text-white">
                <Calendar size={18} strokeWidth={2} />
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-base sm:text-lg tracking-tight text-slate-900 dark:text-white leading-none">
                  Campus<span className="text-blue-500">Events</span>
                </span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:absolute md:left-1/2 md:flex md:-translate-x-1/2 items-center gap-1">
              <Link
                to="/"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
                  isActive('/')
                    ? 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                Home
              </Link>
              <Link
                to="/events"
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
                  isActive('/events')
                    ? 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10'
                    : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                }`}
              >
                Discover Events
              </Link>

              {isAuthenticated && isStudent && (
                <>
                  <Link
                    to="/student/dashboard"
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
                      location.pathname.startsWith('/student') && !location.pathname.includes('/bookings')
                        ? 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                  >
                    My Dashboard
                  </Link>
                  <Link
                    to="/student/bookings"
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-colors ${
                      isActive('/student/bookings')
                        ? 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10'
                        : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                    }`}
                  >
                    My Bookings
                  </Link>
                </>
              )}

              {isAuthenticated && isAdmin && (
                <Link
                  to="/admin/dashboard"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-colors flex items-center gap-1.5 ${
                    location.pathname.startsWith('/admin')
                      ? 'text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10'
                      : 'text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5'
                  }`}
                >
                  <ShieldCheck size={14} />
                  Admin Console
                </Link>
              )}
            </nav>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Theme Toggle Button */}
            <button
              type="button"
              onClick={toggleTheme}
              aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* User Profile / Auth State */}
            {isAuthenticated ? (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-1.5 sm:pr-2.5 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 border border-transparent hover:border-slate-200 dark:hover:border-white/10 transition-colors"
                >
                  <img
                    src={currentUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=128'}
                    alt={currentUser?.name}
                    className="w-7 h-7 rounded-full object-cover ring-2 ring-blue-500/30"
                  />
                  <div className="hidden sm:flex flex-col text-left leading-none">
                    <span className="text-xs font-semibold text-slate-900 dark:text-slate-100">
                      {currentUser?.name?.split(' ')[0]}
                    </span>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400">
                      {currentUser?.role}
                    </span>
                  </div>
                  <ChevronDown size={14} className="hidden sm:block text-slate-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-30"
                      onClick={() => setUserDropdownOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-[#161822] border border-slate-200 dark:border-white/10 shadow-xl dark:shadow-[0_10px_35px_-5px_rgba(0,0,0,0.6)] py-2 z-40 text-xs">
                      <div className="px-3.5 py-2 border-b border-slate-100 dark:border-white/5">
                        <p className="font-semibold text-slate-900 dark:text-white truncate">
                          {currentUser?.name}
                        </p>
                        <p className="text-slate-500 dark:text-slate-400 truncate mt-0.5">
                          {currentUser?.email}
                        </p>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-blue-500/10 text-blue-500 border border-blue-500/20">
                          Role: {currentUser?.role}
                        </span>
                      </div>

                      <div className="py-1">
                        {isStudent && (
                          <>
                            <Link
                              to="/student/dashboard"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                            >
                              <Layers size={14} />
                              Student Dashboard
                            </Link>
                            <Link
                              to="/student/bookings"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                            >
                              <Bookmark size={14} />
                              My Bookings
                            </Link>
                            <Link
                              to="/student/profile"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                            >
                              <User size={14} />
                              Student Profile
                            </Link>
                          </>
                        )}

                        {isAdmin && (
                          <>
                            <Link
                              to="/admin/dashboard"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                            >
                              <ShieldCheck size={14} />
                              Admin Dashboard
                            </Link>
                            <Link
                              to="/admin/events"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                            >
                              <Calendar size={14} />
                              Manage events
                            </Link>
                            <Link
                              to="/admin/categories"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                            >
                              <Sparkles size={14} />
                              Manage categories
                            </Link>
                            <Link
                              to="/admin/bookings"
                              onClick={() => setUserDropdownOpen(false)}
                              className="flex items-center gap-2.5 px-3.5 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
                            >
                              <Bookmark size={14} />
                              Manage bookings
                            </Link>
                          </>
                        )}
                      </div>

                      <div className="pt-1 border-t border-slate-100 dark:border-white/5">
                        <button
                          type="button"
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3.5 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-500/10 text-left"
                        >
                          <LogOut size={14} />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Register
                  </Button>
                </Link>
              </div>
            )}

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-white/10 bg-white/95 dark:bg-[#0a0a0a]/95 backdrop-blur-xl px-4 pt-2 pb-5 space-y-1">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
          >
            Home
          </Link>
          <Link
            to="/events"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
          >
            Discover Events
          </Link>
          {isAuthenticated && isStudent && (
            <>
              <Link
                to="/student/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
              >
                Student Dashboard
              </Link>
              <Link
                to="/student/bookings"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
              >
                My Bookings
              </Link>
              <Link
                to="/student/profile"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
              >
                Profile
              </Link>
            </>
          )}

          {isAuthenticated && isAdmin && (
            <div className="pt-2 border-t border-slate-200 dark:border-white/10 mt-2">
              <span className="block px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                Admin Console
              </span>
              <Link
                to="/admin/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/20"
              >
                Dashboard Overview
              </Link>
              <Link
                to="/admin/events"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
              >
                Manage events
              </Link>
              <Link
                to="/admin/categories"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
              >
                Manage categories
              </Link>
              <Link
                to="/admin/bookings"
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/5"
              >
                Manage bookings
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
