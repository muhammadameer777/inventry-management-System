import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock,
  MapPin,
  Plus,
  RefreshCw,
  Users,
  XCircle,
} from 'lucide-react';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useToast } from '../../context/ToastContext';
import { eventRequestService } from '../../services/eventRequestService';

const statusConfig = {
  PENDING: { label: 'Pending review', variant: 'warning', icon: Clock },
  APPROVED: { label: 'Approved', variant: 'success', icon: CheckCircle2 },
  REJECTED: { label: 'Rejected', variant: 'danger', icon: XCircle },
  CANCELLED: { label: 'Cancelled', variant: 'default', icon: XCircle },
};

const statusFilters = ['all', 'PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];

export const MyEventRequestsPage = () => {
  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [loading, setLoading] = useState(true);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await eventRequestService.getRequests({ status: statusFilter });
      setRequests(data);
    } catch (err) {
      showToast({
        title: 'Error loading event requests',
        message: err.message,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [showToast, statusFilter]);

  useEffect(() => {
    loadRequests();
  }, [loadRequests]);

  return (
    <div className="space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            My Event Requests
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Track the review status of event proposals you have submitted.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Button variant="secondary" size="sm" onClick={loadRequests} loading={loading}>
            {!loading && <RefreshCw size={14} className="mr-1.5" />}
            Refresh
          </Button>
          <Link to="/request-event">
            <Button size="sm" icon={Plus}>New Request</Button>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-1 overflow-x-auto p-1 bg-slate-100 dark:bg-[#151722] rounded-xl border border-slate-200/80 dark:border-white/5 w-fit max-w-full">
        {statusFilters.map((status) => (
          <button
            key={status}
            type="button"
            onClick={() => setStatusFilter(status)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap capitalize transition-all ${
              statusFilter === status
                ? 'bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-sm'
                : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
            }`}
          >
            {status === 'all' ? 'All' : status.toLowerCase()}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="h-36 rounded-2xl bg-white dark:bg-[#141414] animate-pulse"
            />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <ClipboardList size={32} className="mx-auto text-slate-300 dark:text-slate-700" />
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            No event requests found
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {statusFilter === 'all'
              ? "You haven't submitted an event request yet."
              : `You don't have any ${statusFilter.toLowerCase()} requests.`}
          </p>
          {statusFilter === 'all' && (
            <Link to="/request-event" className="inline-flex pt-2">
              <Button size="sm" icon={Plus}>Submit an Event Request</Button>
            </Link>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => {
            const status = statusConfig[request.status] || statusConfig.PENDING;
            const StatusIcon = status.icon;

            return (
              <Card key={request.id} className="p-5 sm:p-6">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1.5">
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                        {request.title}
                      </h3>
                      <Badge variant={status.variant} size="sm" dot>{status.label}</Badge>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Reference <span className="font-mono">{request.referenceCode}</span>
                      {request.categoryName && ` · ${request.categoryName}`}
                    </p>
                  </div>
                  <span className="text-[11px] text-slate-400 shrink-0">
                    Submitted {new Date(request.createdAt).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4 text-xs text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays size={14} />
                    {new Date(`${request.preferredDate}T00:00:00`).toLocaleDateString()}
                    {request.startTime && ` · ${request.startTime}`}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <MapPin size={14} />
                    {request.venue}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Users size={14} />
                    {request.expectedAttendees?.toLocaleString()} expected attendees
                  </span>
                </div>

                {request.adminNote && (
                  <div className="mt-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/[0.03] p-3">
                    <p className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mb-1">
                      Admin note
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {request.adminNote}
                    </p>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
