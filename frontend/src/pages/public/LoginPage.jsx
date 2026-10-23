import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Calendar, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!email) {
      errs.email = 'University email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errs.email = 'Please provide a valid email format';
    }
    if (!password) {
      errs.password = 'Password is required';
    } else if (password.length < 6) {
      errs.password = 'Password must be at least 6 characters';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      const res = await login(email, password);
      showToast({
        title: 'Authentication Successful',
        message: `Welcome back, ${res.user.name}!`,
        type: 'success',
      });

      if (res.user.role === 'ADMIN') {
        navigate('/admin/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (err) {
      showToast({
        title: 'Sign In Failed',
        message: err.message || 'Invalid credentials',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = (role) => {
    if (role === 'STUDENT') {
      setEmail('student@campusevents.local');
      setPassword('password123');
    } else {
      setEmail('admin@campusevents.local');
      setPassword('admin123');
    }
    setErrors({});
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-6">
        
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white mx-auto shadow-lg shadow-blue-500/20">
            <Calendar size={22} />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Sign in to CampusEvents
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Access your university event passes, registrations, and academic schedules.
          </p>
        </div>

        {/* Login Card */}
        <Card className="p-6 sm:p-8 backdrop-blur-xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            
            <Input
              label="University Email"
              type="email"
              icon={Mail}
              placeholder="name@campusevents.edu"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={errors.email}
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              icon={Lock}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={errors.password}
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600 dark:text-slate-400 select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 dark:border-white/10 text-blue-600 focus:ring-blue-500/20"
                />
                Remember me
              </label>

              <button
                type="button"
                onClick={() => showToast({ title: 'Demo Account Passwords', message: 'Use the Student Demo or Admin Demo button below to fill the matching demo credentials.', type: 'info' })}
                className="font-medium text-blue-600 dark:text-blue-400 hover:underline"
              >
                Forgot password?
              </button>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              loading={loading}
              className="w-full mt-2 shadow-lg shadow-blue-500/20"
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-white/5 space-y-2">
            <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 text-center">
              Demo accounts
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('STUDENT')}
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition-colors"
              >
                <UserCheck size={14} className="text-blue-500" />
                Student Demo
              </button>
              <button
                type="button"
                onClick={() => handleQuickDemoLogin('ADMIN')}
                className="flex items-center justify-center gap-1.5 p-2 rounded-xl text-xs font-medium bg-slate-100 hover:bg-slate-200 dark:bg-white/5 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 transition-colors"
              >
                <ShieldCheck size={14} className="text-indigo-500" />
                Admin Demo
              </button>
            </div>
          </div>
        </Card>

        {/* Footer Link */}
        <p className="text-center text-xs text-slate-500 dark:text-slate-400">
          Don't have a student account yet?{' '}
          <Link to="/register" className="font-semibold text-blue-600 dark:text-blue-400 hover:underline">
            Register for CampusEvents
          </Link>
        </p>

      </div>
    </div>
  );
};
