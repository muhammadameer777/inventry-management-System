import React, { useState, useEffect, useCallback } from 'react';
import {
  Search, Eye, CheckCircle2, XCircle, Clock, ClipboardList,
  Calendar, MapPin, Users, Mail, Phone, RefreshCw, ChevronDown, Plus
} from 'lucide-react';
import { eventRequestService } from '../../services/eventRequestService';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Input } from '../../components/common/Input';

const statusConfig = {
  PENDING: { label: 'Pending', variant: 'warning', icon: Clock },
  APPROVED: { label: 'Approved', variant: 'success', icon: CheckCircle2 },
  REJECTED: { label: 'Rejected', variant: 'danger', icon: XCircle },
  CANCELLED: { label: 'Cancelled', variant: 'secondary', icon: XCircle },
};

export const AdminEventRequestsPage = () => {
  const { showToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // View modal
  const [viewRequest, setViewRequest] = useState(null);

  // Approve modal
  const [approveRequest, setApproveRequest] = useState(null);
  const [approveForm, setApproveForm] = useState({ adminNote: '', capacity: '', ticketPrice: '0' });
  const [approving, setApproving] = useState(false);

  // Reject modal
  const [rejectRequest, setRejectRequest] = useState(null);
  const [rejectNote, setRejectNote] = useState('');
  const [rejecting, setRejecting] = useState(false);

  const loadRequests = useCallback(async () => {
    setLoading(true);
    try {
      const data = await eventRequestService.getRequests({ status: statusFilter, search });
      setRequests(data);
    } catch (err) {
      showToast({ title: 'Error', message: err.message, type: 'error' });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, showToast]);

  useEffect(() => { loadRequests(); }, [loadRequests]);

  const handleApprove = async (e) => {
    e.preventDefault();
    if (!approveRequest) return;
    setApproving(true);
    try {
      await eventRequestService.approveAndCreate(approveRequest.id, {
        adminNote: approveForm.adminNote,
        capacity: approveForm.capacity || approveRequest.expectedAttendees,
        ticketPrice: approveForm.ticketPrice,
      });
      showToast({ title: 'Approved', message: 'Request approved and event created.', type: 'success' });
      setApproveRequest(null);
      loadRequests();
    } catch (err) {
      showToast({ title: 'Error', message: err.message, type: 'error' });
    } finally {
      setApproving(false);
    }
  };

  const handleReject = async (e) => {
    e.preventDefault();
    if (!rejectRequest) return;
    setRejecting(true);
    try {
      await eventRequestService.updateStatus(rejectRequest.id, 'REJECTED', rejectNote);
      showToast({ title: 'Rejected', message: 'Event request has been rejected.', type: 'info' });
      setRejectRequest(null);
      setRejectNote('');
      loadRequests();
    } catch (err) {
      showToast({ title: 'Error', message: err.message, type: 'error' });
    } finally {
      setRejecting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Event Requests</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Review and approve event requests submitted by users.
          </p>
        </div>
        <Button onClick={loadRequests} variant="secondary" size="sm">
          <RefreshCw size={14} className="mr-1.5" /> Refresh
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by title, requester, reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-9 pl-9 pr-3 text-xs rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-9 px-3 text-xs rounded-xl bg-white dark:bg-white/[0.04] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        >
          <option value="all">All Statuses</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="REJECTED">Rejected</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-100 dark:bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : requests.length === 0 ? (
          <div className="p-16 text-center">
            <ClipboardList size={40} className="mx-auto text-slate-300 dark:text-slate-700 mb-3" />
            <p className="text-base font-semibold text-slate-600 dark:text-slate-400">No event requests found.</p>
            <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
              {statusFilter !== 'all' ? 'Try changing the status filter.' : 'No requests have been submitted yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 dark:bg-white/[0.02] text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100 dark:border-white/5 font-semibold">
                <tr>
                  <th className="py-3 px-4">Ref ID</th>
                  <th className="py-3 px-4">Event Title</th>
                  <th className="py-3 px-4">Requester</th>
                  <th className="py-3 px-4">Date Requested</th>
                  <th className="py-3 px-4">Attendees</th>
                  <th className="py-3 px-4">Submitted</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {requests.map((req) => {
                  const sc = statusConfig[req.status] || statusConfig.PENDING;
                  return (
                    <tr key={req.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01]">
                      <td className="py-3 px-4 font-mono font-semibold text-[11px] text-slate-700 dark:text-slate-300">
                        {req.referenceCode}
                      </td>
                      <td className="py-3 px-4 font-semibold text-slate-900 dark:text-white max-w-[200px] truncate">
                        {req.title}
                      </td>
                      <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                        <div>{req.requesterName}</div>
                        <div className="text-[10px] text-slate-400">{req.requesterEmail}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{req.preferredDate}</td>
                      <td className="py-3 px-4 text-slate-500">{req.expectedAttendees?.toLocaleString()}</td>
                      <td className="py-3 px-4 text-slate-400">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={sc.variant} size="sm" dot>{sc.label}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => setViewRequest(req)}
                            className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
                          >
                            View
                          </button>
                          {req.status === 'PENDING' && (
                            <>
                              <button
                                onClick={() => { setApproveRequest(req); setApproveForm({ adminNote: '', capacity: req.expectedAttendees, ticketPrice: '0' }); }}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-500/20 transition-colors"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => { setRejectRequest(req); setRejectNote(''); }}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-500/20 transition-colors"
                              >
                                Reject
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* View Request Modal */}
      <Modal
        isOpen={!!viewRequest}
        onClose={() => setViewRequest(null)}
        title={`Request: ${viewRequest?.referenceCode}`}
        subtitle={viewRequest?.title}
        maxWidth="max-w-2xl"
      >
        {viewRequest && (
          <div className="space-y-4 text-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Status</p>
                <Badge variant={statusConfig[viewRequest.status]?.variant || 'secondary'} size="sm">
                  {viewRequest.status}
                </Badge>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Reference</p>
                <p className="font-mono font-semibold text-slate-900 dark:text-white">{viewRequest.referenceCode}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Preferred Date</p>
                <p className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                  <Calendar size={12} /> {viewRequest.preferredDate}
                  {viewRequest.startTime && ` · ${viewRequest.startTime} – ${viewRequest.endTime}`}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Expected Attendees</p>
                <p className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                  <Users size={12} /> {viewRequest.expectedAttendees?.toLocaleString()}
                </p>
              </div>
              <div className="col-span-2">
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Venue</p>
                <p className="flex items-center gap-1 text-slate-700 dark:text-slate-300">
                  <MapPin size={12} /> {viewRequest.venue}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Organizer</p>
                <p className="text-slate-700 dark:text-slate-300">{viewRequest.organizerName}</p>
              </div>
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Contact</p>
                <p className="flex items-center gap-1 text-slate-700 dark:text-slate-300 text-xs">
                  <Mail size={11} /> {viewRequest.contactEmail}
                </p>
                {viewRequest.contactPhone && (
                  <p className="flex items-center gap-1 text-slate-700 dark:text-slate-300 text-xs mt-0.5">
                    <Phone size={11} /> {viewRequest.contactPhone}
                  </p>
                )}
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Description</p>
              <p className="text-slate-700 dark:text-slate-300 text-xs leading-relaxed bg-slate-50 dark:bg-white/[0.03] p-3 rounded-xl">
                {viewRequest.description}
              </p>
            </div>
            {viewRequest.requirements && (
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Requirements</p>
                <p className="text-slate-700 dark:text-slate-300 text-xs">{viewRequest.requirements}</p>
              </div>
            )}
            {viewRequest.budget && (
              <div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Budget</p>
                <p className="text-slate-700 dark:text-slate-300 text-xs">{viewRequest.budget}</p>
              </div>
            )}
            {viewRequest.adminNote && (
              <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/30 rounded-xl">
                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 mb-1">Admin Note</p>
                <p className="text-xs text-amber-700 dark:text-amber-400">{viewRequest.adminNote}</p>
              </div>
            )}
            {viewRequest.status === 'PENDING' && (
              <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => { setViewRequest(null); setApproveRequest(viewRequest); setApproveForm({ adminNote: '', capacity: viewRequest.expectedAttendees, ticketPrice: '0' }); }}
                >
                  <CheckCircle2 size={13} className="mr-1.5" /> Approve & Create Event
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => { setViewRequest(null); setRejectRequest(viewRequest); setRejectNote(''); }}
                >
                  <XCircle size={13} className="mr-1.5" /> Reject
                </Button>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Approve Modal */}
      <Modal
        isOpen={!!approveRequest}
        onClose={() => setApproveRequest(null)}
        title="Approve & Create Event"
        subtitle={approveRequest?.title}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleApprove} className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Approving this request will automatically create a published event. You can edit it afterwards.
          </p>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Event Capacity
            </label>
            <input
              type="number"
              min="1"
              value={approveForm.capacity}
              onChange={(e) => setApproveForm((p) => ({ ...p, capacity: e.target.value }))}
              placeholder={`Default: ${approveRequest?.expectedAttendees}`}
              className="w-full h-10 px-3 rounded-xl bg-white dark:bg-[#161821] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Ticket Price ($) — 0 for free
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={approveForm.ticketPrice}
              onChange={(e) => setApproveForm((p) => ({ ...p, ticketPrice: e.target.value }))}
              className="w-full h-10 px-3 rounded-xl bg-white dark:bg-[#161821] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Note to Requester (optional)
            </label>
            <textarea
              value={approveForm.adminNote}
              onChange={(e) => setApproveForm((p) => ({ ...p, adminNote: e.target.value }))}
              rows={2}
              placeholder="Congratulations! Your event has been approved..."
              className="w-full p-2.5 rounded-xl bg-white dark:bg-[#161821] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 resize-none"
            />
          </div>

          <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
            <Button type="button" variant="secondary" size="sm" onClick={() => setApproveRequest(null)} disabled={approving}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" loading={approving}>
              <CheckCircle2 size={13} className="mr-1.5" /> Approve & Create Event
            </Button>
          </div>
        </form>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={!!rejectRequest}
        onClose={() => setRejectRequest(null)}
        title="Reject Event Request"
        subtitle={rejectRequest?.title}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleReject} className="space-y-4">
          <p className="text-xs text-slate-500 dark:text-slate-400">
            The requester will be able to see this decision and your reason.
          </p>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Reason for Rejection (optional)
            </label>
            <textarea
              value={rejectNote}
              onChange={(e) => setRejectNote(e.target.value)}
              rows={3}
              placeholder="e.g. Venue not available on requested date..."
              className="w-full p-2.5 rounded-xl bg-white dark:bg-[#161821] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 resize-none"
            />
          </div>
          <div className="flex gap-2 pt-2 border-t border-slate-100 dark:border-white/5">
            <Button type="button" variant="secondary" size="sm" onClick={() => setRejectRequest(null)} disabled={rejecting}>
              Cancel
            </Button>
            <Button type="submit" variant="danger" size="sm" loading={rejecting}>
              <XCircle size={13} className="mr-1.5" /> Confirm Rejection
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
