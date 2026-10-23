import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { 
  Ticket, 
  Calendar, 
  Clock, 
  MapPin, 
  QrCode, 
  AlertCircle, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Trash2, 
  Download,
  Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { bookingService } from '../../services/bookingService';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const MyBookingsPage = () => {
  const { currentUser } = useAuth();
  const { showToast } = useToast();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  // Ticket Pass Modal
  const [selectedPass, setSelectedPass] = useState(null);
  const [passModalOpen, setPassModalOpen] = useState(false);

  // Cancel Confirmation Dialog
  const [bookingToCancel, setBookingToCancel] = useState(null);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  const loadBookings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await bookingService.getBookings({
        userId: currentUser?.id,
        status: statusFilter,
        search,
      });
      setBookings(data);
    } catch (err) {
      showToast({
        title: 'Error loading bookings',
        message: err.message,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [currentUser?.id, statusFilter, search, showToast]);

  useEffect(() => {
    if (currentUser?.id) {
      loadBookings();
    }
  }, [loadBookings, currentUser?.id]);

  const handleOpenCancelDialog = (booking) => {
    setBookingToCancel(booking);
    setCancelDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!bookingToCancel) return;
    setCancelling(true);
    try {
      await bookingService.cancelBooking(
        bookingToCancel.id,
        'Cancelled by student through online self-service.'
      );
      showToast({
        title: 'Booking Cancelled',
        message: `Your booking for "${bookingToCancel.eventTitle}" was cancelled and seat released.`,
        type: 'info',
      });
      setCancelDialogOpen(false);
      setBookingToCancel(null);
      loadBookings();
    } catch (err) {
      showToast({
        title: 'Cancellation Error',
        message: err.message,
        type: 'error',
      });
    } finally {
      setCancelling(false);
    }
  };

  const handleOpenPassModal = (booking) => {
    setSelectedPass(booking);
    setPassModalOpen(true);
  };

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return <Badge variant="success" dot>{status}</Badge>;
      case 'pending':
        return <Badge variant="warning" dot>{status}</Badge>;
      case 'cancelled':
        return <Badge variant="danger" dot>{status}</Badge>;
      default:
        return <Badge variant="default">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            My Event Bookings & Passes
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            View admission credentials, scan codes, or cancel unneeded reservations.
          </p>
        </div>

        {/* Filter status tabs */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#151722] rounded-xl border border-slate-200/80 dark:border-white/5 self-start sm:self-auto text-xs">
          {['all', 'confirmed', 'cancelled'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1 rounded-lg font-medium capitalize transition-all ${
                statusFilter === st
                  ? 'bg-white dark:bg-blue-600 text-slate-900 dark:text-white shadow-xs'
                  : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings List / Cards */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-28 rounded-2xl bg-white dark:bg-[#141414] animate-pulse" />
          ))}
        </div>
      ) : bookings.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-white/5 text-slate-400 flex items-center justify-center mx-auto">
            <Ticket size={22} />
          </div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-white">
            No bookings found
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
            {statusFilter === 'all'
              ? "You haven't reserved tickets for any university events yet."
              : `You have no ${statusFilter} event passes.`}
          </p>
          <div className="pt-2">
            <Link to="/events">
              <Button size="sm" variant="primary">
                Browse Campus Events
              </Button>
            </Link>
          </div>
        </Card>
      ) : (
        <div className="space-y-3">
          {bookings.map((booking) => (
            <Card
              key={booking.id}
              className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              {/* Left Details */}
              <div className="flex items-start gap-4 flex-1 min-w-0">
                <img
                  src={booking.coverImage}
                  alt={booking.eventTitle}
                  className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover shrink-0"
                />

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-blue-500">
                      {booking.eventCategory}
                    </span>
                    {getStatusBadge(booking.status)}
                    <span className="text-[11px] font-mono text-slate-400">
                      Ref: {booking.referenceCode}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-semibold text-slate-900 dark:text-white truncate">
                    {booking.eventTitle}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 dark:text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-blue-500 shrink-0" />
                      <span>{booking.eventDate}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock size={13} className="text-slate-400 shrink-0" />
                      <span>{booking.eventTime}</span>
                    </div>
                    <div className="flex items-center gap-1.5 truncate">
                      <MapPin size={13} className="text-slate-400 shrink-0" />
                      <span className="truncate">{booking.eventLocation}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Action Controls */}
              <div className="flex items-center gap-2 shrink-0 pt-3 md:pt-0 border-t md:border-t-0 border-slate-100 dark:border-white/5">
                <Button
                  variant="secondary"
                  size="sm"
                  icon={Eye}
                  onClick={() => handleOpenPassModal(booking)}
                >
                  View Pass
                </Button>

                {booking.status === 'Confirmed' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-rose-600 hover:text-rose-700 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                    onClick={() => handleOpenCancelDialog(booking)}
                  >
                    Cancel Booking
                  </Button>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Ticket Pass Modal Dialog (Apple Wallet / Pass style) */}
      <Modal
        isOpen={passModalOpen}
        onClose={() => setPassModalOpen(false)}
        title="Official Event Pass"
        subtitle="Present this verified mobile ticket at venue entrance"
        maxWidth="max-w-md"
      >
        {selectedPass && (
          <div className="space-y-5">
            {/* Liquid Pass Card */}
            <div className="rounded-3xl p-6 bg-gradient-to-br from-blue-600 to-indigo-800 text-white shadow-xl space-y-5 relative overflow-hidden">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-widest text-blue-200">
                    CampusEvents • Admission Pass
                  </span>
                  <h4 className="text-base sm:text-lg font-bold mt-1 line-clamp-2">
                    {selectedPass.eventTitle}
                  </h4>
                </div>
                <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center shrink-0">
                  <Ticket size={18} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs pt-2 border-t border-white/20">
                <div>
                  <span className="block text-[10px] text-blue-200 uppercase font-medium">Student</span>
                  <span className="font-semibold">{selectedPass.studentName}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-blue-200 uppercase font-medium">Student ID</span>
                  <span className="font-mono font-semibold">{selectedPass.studentId}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-blue-200 uppercase font-medium">Date & Time</span>
                  <span className="font-semibold">{selectedPass.eventDate}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-blue-200 uppercase font-medium">Reference Code</span>
                  <span className="font-mono font-semibold">{selectedPass.referenceCode}</span>
                </div>
              </div>

              {/* Simulated QR Code surface */}
              <div className="p-4 rounded-2xl bg-white text-slate-900 text-center space-y-2">
                <div className="w-32 h-32 mx-auto bg-slate-900 rounded-xl p-2 flex items-center justify-center text-white">
                  <QrCode size={100} strokeWidth={1.5} />
                </div>
                <p className="font-mono text-[11px] font-bold text-slate-700 tracking-wider">
                  {selectedPass.referenceCode}
                </p>
                <p className="text-[10px] text-slate-500">
                  Status: {selectedPass.status} • Ticket: {selectedPass.ticketType}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <Button
                variant="secondary"
                size="md"
                onClick={() => setPassModalOpen(false)}
              >
                Close Pass
              </Button>
            </div>
          </div>
        )}
      </Modal>

      {/* Cancellation Confirmation Dialog */}
      <ConfirmDialog
        isOpen={cancelDialogOpen}
        onClose={() => setCancelDialogOpen(false)}
        onConfirm={handleConfirmCancel}
        title="Cancel Event Reservation?"
        message={`Are you sure you want to cancel your pass for "${bookingToCancel?.eventTitle}"? Your seat will immediately be released to other students on the waiting list.`}
        confirmText="Yes, Cancel Booking"
        cancelText="Keep My Booking"
        isDanger={true}
        loading={cancelling}
      />
    </div>
  );
};
