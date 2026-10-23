import React, { useState, useEffect, useCallback } from 'react';
import { 
  Bookmark, 
  Search, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle2, 
  Clock, 
  XCircle, 
  AlertCircle,
  QrCode,
  Filter,
  User,
  Calendar
} from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import { eventService } from '../../services/eventService';
import { mockUsers } from '../../data/mockUsers';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const AdminBookingsPage = () => {
  const { showToast } = useToast();
  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Create Modal State (Admin manual registration)
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentId, setStudentId] = useState('');
  const [ticketType, setTicketType] = useState('Standard Student Pass');
  const [notes, setNotes] = useState('');
  const [createErrors, setCreateErrors] = useState({});
  const [creating, setCreating] = useState(false);

  // Status Edit Modal State (UPDATE)
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [bookingToEdit, setBookingToEdit] = useState(null);
  const [newStatus, setNewStatus] = useState('Confirmed');
  const [statusNotes, setStatusNotes] = useState('');
  const [updating, setUpdating] = useState(false);

  // Delete Dialog State (DELETE)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [allBookings, allEvents] = await Promise.all([
        bookingService.getBookings({ status: statusFilter, search }),
        eventService.getEvents(),
      ]);
      setBookings(allBookings);
      setEvents(allEvents);
      if (allEvents.length > 0 && !selectedEventId) {
        setSelectedEventId(allEvents[0].id);
      }
    } catch (err) {
      showToast({
        title: 'Error loading registrations',
        message: err.message,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [statusFilter, search, selectedEventId, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setStudentName('');
    setStudentEmail('');
    setStudentId('CE-2026-');
    setTicketType('Standard Student Pass');
    setNotes('Manually registered by university event administrator.');
    setCreateErrors({});
    setCreateModalOpen(true);
  };

  const validateCreate = () => {
    const errs = {};
    if (!selectedEventId) errs.eventId = 'Please select a campus event';
    if (!studentName.trim()) errs.name = 'Student full name is required';
    if (!studentEmail.trim() || !/\S+@\S+\.\S+/.test(studentEmail)) {
      errs.email = 'Valid student email required';
    }
    if (!studentId.trim()) errs.studentId = 'Student ID required';
    setCreateErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit Manual Registration (CREATE)
  const handleConfirmCreate = async (e) => {
    e.preventDefault();
    if (!validateCreate()) return;

    setCreating(true);
    try {
      const targetEvent = events.find((e) => e.id === selectedEventId);
      if (!targetEvent) throw new Error('Selected event was not found');

      const mockStudentUser = {
        id: `user-manual-${Date.now()}`,
        name: studentName,
        email: studentEmail,
        studentId: studentId,
      };

      await bookingService.createBooking({
        event: targetEvent,
        user: mockStudentUser,
        ticketType,
        notes,
      });

      showToast({
        title: 'Registration Created',
        message: `Registered ${studentName} for "${targetEvent.title}".`,
        type: 'success',
      });

      setCreateModalOpen(false);
      loadData();
    } catch (err) {
      showToast({
        title: 'Registration Error',
        message: err.message,
        type: 'error',
      });
    } finally {
      setCreating(false);
    }
  };

  // Open Status Edit Modal (UPDATE)
  const handleOpenStatusModal = (booking) => {
    setBookingToEdit(booking);
    setNewStatus(booking.status || 'Confirmed');
    setStatusNotes(booking.notes || '');
    setStatusModalOpen(true);
  };

  // Save Status Change (UPDATE)
  const handleSaveStatus = async (e) => {
    e.preventDefault();
    if (!bookingToEdit) return;

    setUpdating(true);
    try {
      await bookingService.updateBooking(bookingToEdit.id, {
        status: newStatus,
        notes: statusNotes,
      });

      showToast({
        title: 'Booking Status Updated',
        message: `Reference ${bookingToEdit.referenceCode} set to ${newStatus}.`,
        type: 'success',
      });

      setStatusModalOpen(false);
      loadData();
    } catch (err) {
      showToast({
        title: 'Update Error',
        message: err.message,
        type: 'error',
      });
    } finally {
      setUpdating(false);
    }
  };

  // Open Delete Confirmation Dialog (DELETE)
  const handleOpenDelete = (booking) => {
    setBookingToDelete(booking);
    setDeleteDialogOpen(true);
  };

  // Confirm Delete Registration (DELETE)
  const handleConfirmDelete = async () => {
    if (!bookingToDelete) return;

    setDeleting(true);
    try {
      await bookingService.deleteBooking(bookingToDelete.id);
      showToast({
        title: 'Registration Removed',
        message: `Record ${bookingToDelete.referenceCode} was purged from system.`,
        type: 'success',
      });

      setDeleteDialogOpen(false);
      setBookingToDelete(null);
      loadData();
    } catch (err) {
      showToast({
        title: 'Delete Failed',
        message: err.message,
        type: 'error',
      });
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Booking & Registration Management
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Review registrations and manage attendee bookings.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={handleOpenCreateModal}
          className="shadow-md shadow-blue-500/20 self-start sm:self-auto"
        >
          Add Registration
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 flex flex-col sm:flex-row gap-3 items-center">
        <div className="relative flex-1 w-full">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by student name, reference code, email, or event title..."
            className="w-full h-10 pl-10 pr-3 rounded-xl bg-slate-50 dark:bg-[#161821] border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-[#161821] border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-300 outline-none w-full sm:w-auto"
        >
          <option value="all">All Statuses</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </Card>

      {/* Bookings Table (READ) */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-slate-100 dark:bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Bookmark size={28} className="text-slate-400 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              No registration records found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No student registrations match your current filter criteria.
            </p>
            <Button size="sm" variant="secondary" onClick={handleOpenCreateModal}>
              Register a Student
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 dark:bg-white/[0.02] text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100 dark:border-white/5 font-semibold">
                <tr>
                  <th className="py-3.5 px-6">Reference ID</th>
                  <th className="py-3.5 px-6">Student Information</th>
                  <th className="py-3.5 px-6">Campus Event</th>
                  <th className="py-3.5 px-6">Booking Date</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {bookings.map((bkg) => (
                  <tr key={bkg.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                    
                    {/* Reference ID */}
                    <td className="py-4 px-6 font-mono text-[11px] font-semibold text-slate-800 dark:text-slate-200">
                      {bkg.referenceCode}
                    </td>

                    {/* Student Info */}
                    <td className="py-4 px-6">
                      <div className="font-semibold text-slate-900 dark:text-white">
                        {bkg.studentName}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        {bkg.studentEmail} • <span className="font-mono">{bkg.studentId}</span>
                      </div>
                    </td>

                    {/* Event Info */}
                    <td className="py-4 px-6 max-w-xs">
                      <div className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                        {bkg.eventTitle}
                      </div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                        {bkg.eventDate} • {bkg.eventCategory}
                      </div>
                    </td>

                    {/* Booking Date */}
                    <td className="py-4 px-6 text-slate-500">
                      {new Date(bkg.bookingDate).toLocaleDateString()}
                    </td>

                    {/* Status Badge */}
                    <td className="py-4 px-6">
                      <Badge
                        variant={bkg.status === 'Confirmed' ? 'success' : bkg.status === 'Pending' ? 'warning' : 'danger'}
                        size="sm"
                        dot
                      >
                        {bkg.status}
                      </Badge>
                    </td>

                    {/* Actions (UPDATE, DELETE) */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenStatusModal(bkg)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                          title="Update booking status"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDelete(bkg)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          title="Delete booking record"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Manual Registration Modal (CREATE) */}
      <Modal
        isOpen={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        title="Register Student for Event"
        subtitle="Administrator manual registration entry"
        maxWidth="max-w-lg"
      >
        <form onSubmit={handleConfirmCreate} className="space-y-4">
          <div className="space-y-1 text-xs">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Target Campus Event
            </label>
            <select
              value={selectedEventId}
              onChange={(e) => setSelectedEventId(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-white dark:bg-[#161821] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 text-xs"
            >
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title} ({e.date}) — {e.registeredCount || 0}/{e.capacity} seats
                </option>
              ))}
            </select>
            {createErrors.eventId && (
              <p className="text-xs text-rose-500 mt-1">{createErrors.eventId}</p>
            )}
          </div>

          <Input
            label="Student Full Name"
            type="text"
            placeholder="Elena Rostova"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            error={createErrors.name}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Student University Email"
              type="email"
              placeholder="elena@campusevents.edu"
              value={studentEmail}
              onChange={(e) => setStudentEmail(e.target.value)}
              error={createErrors.email}
            />

            <Input
              label="Student Identification"
              type="text"
              placeholder="CE-2026-9214"
              value={studentId}
              onChange={(e) => setStudentId(e.target.value)}
              error={createErrors.studentId}
            />
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Admission Pass Type
            </label>
            <select
              value={ticketType}
              onChange={(e) => setTicketType(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-white dark:bg-[#161821] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 text-xs"
            >
              <option value="Standard Student Pass">Standard Student Pass</option>
              <option value="Lab Workstation Reserved Pass">Lab Workstation Reserved Pass</option>
              <option value="VIP Priority Seating">VIP Priority Seating</option>
            </select>
          </div>

          <Input
            label="Administrative Notes"
            isTextArea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
          />

          <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-end gap-2.5">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setCreateModalOpen(false)}
              disabled={creating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={creating}
            >
              Register Student
            </Button>
          </div>
        </form>
      </Modal>

      {/* Status Update Modal (UPDATE) */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title="Update Booking Status"
        subtitle={`Managing reference code: ${bookingToEdit?.referenceCode}`}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSaveStatus} className="space-y-4">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-[#1a1d28] border border-slate-200 dark:border-white/5 text-xs space-y-1">
            <span className="text-slate-400 uppercase font-semibold text-[10px]">Student</span>
            <div className="font-bold text-slate-800 dark:text-slate-200">
              {bookingToEdit?.studentName} ({bookingToEdit?.studentEmail})
            </div>
            <div className="text-slate-500">
              Event: {bookingToEdit?.eventTitle}
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <label className="font-semibold text-slate-700 dark:text-slate-300">
              Booking Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full h-10 px-3 rounded-xl bg-white dark:bg-[#161821] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 text-xs"
            >
              <option value="Confirmed">Confirmed (Active Pass)</option>
              <option value="Pending">Pending (Under Clearance)</option>
              <option value="Cancelled">Cancelled (Seat Released)</option>
            </select>
          </div>

          <Input
            label="Status Reason / Audit Notes"
            isTextArea
            rows={2}
            value={statusNotes}
            onChange={(e) => setStatusNotes(e.target.value)}
            placeholder="e.g. Cleared by student affairs / requested seat release..."
          />

          <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-end gap-2.5">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setStatusModalOpen(false)}
              disabled={updating}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={updating}
            >
              Save Status
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog (DELETE) */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Remove Registration Record?"
        message={`Are you sure you want to delete registration "${bookingToDelete?.referenceCode}" for student ${bookingToDelete?.studentName}? This will purge the student's pass record from the university system.`}
        confirmText="Delete Registration"
        cancelText="Cancel"
        isDanger={true}
        loading={deleting}
      />

    </div>
  );
};
