import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar, Users, Ticket, ClipboardList, TrendingUp,
  ArrowUpRight, Clock, CheckCircle2, AlertCircle, RefreshCw
} from 'lucide-react';
import { userService } from '../../services/userService';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';

const StatCard = ({ title, value, subtitle, icon: Icon, color = 'blue', to }) => {
  const colors = {
    blue: 'bg-blue-50 dark:bg-blue-950/30 text-blue-600 dark:text-blue-400',
    indigo: 'bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400',
    emerald: 'bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400',
    amber: 'bg-amber-50 dark:bg-amber-950/30 text-amber-600 dark:text-amber-400',
    rose: 'bg-rose-50 dark:bg-rose-950/30 text-rose-600 dark:text-rose-400',
    purple: 'bg-purple-50 dark:bg-purple-950/30 text-purple-600 dark:text-purple-400',
  };

  const card = (
    <div className="bg-white dark:bg-[#141414] border border-slate-200/80 dark:border-white/5 rounded-2xl p-5 space-y-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${colors[color]}`}>
          <Icon size={20} />
        </div>
        {to && <ArrowUpRight size={16} className="text-slate-400" />}
      </div>
      <div>
        <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
        <div className="text-sm font-medium text-slate-600 dark:text-slate-400 mt-0.5">{title}</div>
        {subtitle && <div className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">{subtitle}</div>}
      </div>
    </div>
  );

  return to ? <Link to={to}>{card}</Link> : card;
};

export const AdminDashboardPage = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadStats = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await userService.getStats();
      setStats(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStats(); }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="h-28 bg-slate-100 dark:bg-white/5 rounded-2xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertCircle className="text-rose-500" size={40} />
        <p className="text-slate-600 dark:text-slate-400">{error}</p>
        <Button onClick={loadStats} variant="primary" size="sm">
          <RefreshCw size={14} className="mr-2" /> Retry
        </Button>
      </div>
    );
  }

  const statusBadgeVariant = (s) => {
    if (s === 'CONFIRMED' || s === 'CHECKED_IN') return 'success';
    if (s === 'PENDING') return 'warning';
    if (s === 'APPROVED') return 'success';
    if (s === 'REJECTED') return 'danger';
    return 'secondary';
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Events" value={stats?.totalEvents ?? 0} subtitle={`${stats?.publishedEvents ?? 0} published`} icon={Calendar} color="blue" to="/admin/events" />
        <StatCard title="Upcoming Events" value={stats?.upcomingEvents ?? 0} subtitle="Published & future" icon={Clock} color="indigo" to="/admin/events" />
        <StatCard title="Total Bookings" value={stats?.totalBookings ?? 0} subtitle={`${stats?.confirmedBookings ?? 0} confirmed`} icon={Ticket} color="emerald" to="/admin/bookings" />
        <StatCard title="Pending Requests" value={stats?.pendingRequests ?? 0} subtitle={`${stats?.totalRequests ?? 0} total requests`} icon={ClipboardList} color="amber" to="/admin/event-requests" />
        <StatCard title="Total Users" value={stats?.totalUsers ?? 0} subtitle="Registered accounts" icon={Users} color="purple" to="/admin/users" />
        <StatCard
          title="Revenue"
          value={`$${(stats?.totalRevenue ?? 0).toFixed(2)}`}
          subtitle="From confirmed bookings"
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard title="All Requests" value={stats?.totalRequests ?? 0} subtitle="Event requests submitted" icon={ClipboardList} color="blue" to="/admin/event-requests" />
        <StatCard title="Active Events" value={stats?.publishedEvents ?? 0} subtitle="Open for registration" icon={CheckCircle2} color="indigo" to="/admin/events" />
      </div>

      {/* Two-column row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bookings */}
        <Card className="overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Bookings</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Latest registrations</p>
            </div>
            <Link to="/admin/bookings">
              <Button variant="secondary" size="sm">View All</Button>
            </Link>
          </div>

          {!stats?.recentBookings?.length ? (
            <div className="p-8 text-center">
              <Ticket size={28} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-sm text-slate-500 dark:text-slate-400">No bookings yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {stats.recentBookings.map((b) => (
                <div key={b.id} className="px-5 py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{b.userName}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{b.eventTitle}</p>
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5">{b.referenceCode}</p>
                  </div>
                  <Badge variant={statusBadgeVariant(b.status)} size="sm">{b.status}</Badge>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Recent Event Requests */}
        <Card className="overflow-hidden">
          <div className="p-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Recent Event Requests</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">Submitted by users</p>
            </div>
            <Link to="/admin/event-requests">
              <Button variant="secondary" size="sm">View All</Button>
            </Link>
          </div>

          {!stats?.recentRequests?.length ? (
            <div className="p-8 text-center">
              <ClipboardList size={28} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
              <p className="text-sm text-slate-500 dark:text-slate-400">No event requests yet.</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 dark:divide-white/5">
              {stats.recentRequests.map((r) => (
                <div key={r.id} className="px-5 py-3 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{r.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{r.requesterName}</p>
                    <p className="text-[10px] font-mono text-slate-400 mt-0.5">{r.referenceCode}</p>
                  </div>
                  <Badge
                    variant={r.status === 'PENDING' ? 'warning' : r.status === 'APPROVED' ? 'success' : 'danger'}
                    size="sm"
                  >
                    {r.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { label: 'Manage Events', to: '/admin/events', icon: Calendar, color: 'blue' },
            { label: 'Event Requests', to: '/admin/event-requests', icon: ClipboardList, color: 'amber' },
            { label: 'Bookings', to: '/admin/bookings', icon: Ticket, color: 'emerald' },
            { label: 'Categories', to: '/admin/categories', icon: Clock, color: 'indigo' },
            { label: 'Users', to: '/admin/users', icon: Users, color: 'purple' },
            { label: 'Refresh', onClick: loadStats, icon: RefreshCw, color: 'rose' },
          ].map((action) => {
            const Icon = action.icon;
            const cls = `flex flex-col items-center gap-2 p-3 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/[0.03] hover:border-${action.color}-400 dark:hover:border-${action.color}-500/50 transition-colors cursor-pointer text-center group`;
            const inner = (
              <>
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Icon size={16} className="text-slate-600 dark:text-slate-400" />
                </div>
                <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300">{action.label}</span>
              </>
            );
            return action.to
              ? <Link key={action.label} to={action.to} className={cls}>{inner}</Link>
              : <button key={action.label} onClick={action.onClick} className={cls}>{inner}</button>;
          })}
        </div>
      </Card>
    </div>
  );
};
