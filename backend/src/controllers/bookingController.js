import prisma from '../config/db.js';

const formatBooking = (b) => ({
  id: b.id,
  referenceCode: b.referenceCode,
  eventId: b.eventId,
  eventTitle: b.event?.title || 'Unknown Event',
  eventDate: b.event?.date || '',
  eventTime: b.event ? `${b.event.startTime} – ${b.event.endTime}` : '',
  eventLocation: b.event?.location || '',
  eventCategory: b.event?.category?.name || 'General',
  eventStatus: b.event?.status || '',
  coverImage: b.event?.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=600',
  userId: b.userId,
  userName: b.user?.name || '',
  userEmail: b.user?.email || '',
  bookingDate: b.bookingDate,
  status: b.status,
  ticketType: b.ticketType || 'General Admission',
  quantity: b.quantity || 1,
  totalAmount: b.totalAmount ?? 0,
  notes: b.notes || '',
  checkedIn: b.checkedIn || false,
  checkedInAt: b.checkedInAt || null,
  createdAt: b.createdAt,
});

export const getAllBookings = async (req, res, next) => {
  try {
    const { status, search, userId, eventId } = req.query;
    const where = {};

    // Students can only see their own bookings
    if (req.user.role === 'USER' || req.user.role === 'ORGANIZER') {
      where.userId = req.user.id;
    } else if (userId) {
      where.userId = userId;
    }

    if (eventId) where.eventId = eventId;

    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    if (search?.trim()) {
      const q = search.trim();
      where.OR = [
        { referenceCode: { contains: q } },
        { user: { name: { contains: q } } },
        { user: { email: { contains: q } } },
        { event: { title: { contains: q } } },
      ];
    }

    const bookings = await prisma.booking.findMany({
      where,
      include: {
        user: { select: { id: true, name: true, email: true } },
        event: { include: { category: true } },
      },
      orderBy: { bookingDate: 'desc' },
    });

    return res.status(200).json({ success: true, data: bookings.map(formatBooking) });
  } catch (error) {
    next(error);
  }
};

export const getBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { user: true, event: { include: { category: true } } },
    });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    // Non-admins can only access own bookings
    if (req.user.role !== 'ADMIN' && booking.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    return res.status(200).json({ success: true, data: formatBooking(booking) });
  } catch (error) {
    next(error);
  }
};

export const createBooking = async (req, res, next) => {
  try {
    const { eventId, ticketType, quantity, notes } = req.body;
    if (!eventId) return res.status(400).json({ success: false, message: 'Event ID is required.' });

    const targetUserId = req.user.id;
    const qty = Math.max(1, Number(quantity) || 1);

    // Check event exists and is published
    const event = await prisma.event.findUnique({
      where: { id: eventId },
      include: { _count: { select: { bookings: { where: { status: { not: 'CANCELLED' } } } } } },
    });
    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });
    if (event.status !== 'PUBLISHED')
      return res.status(400).json({ success: false, message: 'This event is not open for registration.' });

    // Check capacity
    const spotsLeft = event.capacity - (event._count?.bookings || 0);
    if (spotsLeft < qty)
      return res.status(400).json({ success: false, message: `Only ${spotsLeft} spot(s) remaining.` });

    // Prevent duplicate booking
    const existingBooking = await prisma.booking.findFirst({
      where: { userId: targetUserId, eventId, status: { not: 'CANCELLED' } },
    });
    if (existingBooking)
      return res.status(409).json({ success: false, message: 'You already have an active booking for this event.' });

    // Generate reference code
    const refNum = Math.floor(10000 + Math.random() * 90000);
    const referenceCode = `CE-${refNum}`;
    const totalAmount = (event.ticketPrice || 0) * qty;

    const booking = await prisma.booking.create({
      data: {
        referenceCode,
        userId: targetUserId,
        eventId,
        ticketType: ticketType || 'General Admission',
        quantity: qty,
        totalAmount,
        notes: notes?.trim() || null,
        status: 'CONFIRMED',
      },
      include: { user: true, event: { include: { category: true } } },
    });

    return res.status(201).json({ success: true, message: 'Booking confirmed.', data: formatBooking(booking) });
  } catch (error) {
    next(error);
  }
};

export const cancelBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    const booking = await prisma.booking.findUnique({ where: { id }, include: { event: true } });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    // Ownership check for non-admins
    if (req.user.role !== 'ADMIN' && booking.userId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (booking.status === 'CANCELLED') {
      return res.status(400).json({ success: false, message: 'Booking is already cancelled.' });
    }

    const updatedNotes = reason
      ? `${booking.notes ? booking.notes + ' | ' : ''}Cancellation reason: ${reason}`
      : booking.notes;

    await prisma.booking.update({
      where: { id },
      data: { status: 'CANCELLED', notes: updatedNotes },
    });

    return res.status(200).json({ success: true, message: 'Booking cancelled.' });
  } catch (error) {
    next(error);
  }
};

export const updateBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, ticketType, notes } = req.body;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { user: true, event: { include: { category: true } } },
    });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

    // Non-admins can only cancel own booking
    if (req.user.role !== 'ADMIN') {
      if (booking.userId !== req.user.id)
        return res.status(403).json({ success: false, message: 'Access denied.' });
      if (status && status !== 'CANCELLED')
        return res.status(403).json({ success: false, message: 'You can only cancel your own booking.' });
    }

    const validStatuses = ['CONFIRMED', 'PENDING', 'CANCELLED', 'CHECKED_IN'];
    const updated = await prisma.booking.update({
      where: { id },
      data: {
        ...(status && validStatuses.includes(status.toUpperCase()) ? { status: status.toUpperCase() } : {}),
        ...(ticketType ? { ticketType } : {}),
        ...(notes !== undefined ? { notes } : {}),
      },
      include: { user: true, event: { include: { category: true } } },
    });

    return res.status(200).json({ success: true, message: 'Booking updated.', data: formatBooking(updated) });
  } catch (error) {
    next(error);
  }
};

export const checkInBooking = async (req, res, next) => {
  try {
    const { id } = req.params;

    const booking = await prisma.booking.findUnique({
      where: { id },
      include: { user: { select: { name: true, email: true } }, event: { select: { title: true } } },
    });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    if (booking.status === 'CANCELLED')
      return res.status(400).json({ success: false, message: 'Cancelled bookings cannot be checked in.' });
    if (booking.checkedIn)
      return res.status(409).json({ success: false, message: 'Ticket already checked in.', data: formatBooking(booking) });

    const updated = await prisma.booking.update({
      where: { id },
      data: { checkedIn: true, checkedInAt: new Date(), status: 'CHECKED_IN' },
      include: { user: true, event: { include: { category: true } } },
    });

    return res.status(200).json({ success: true, message: 'Check-in successful.', data: formatBooking(updated) });
  } catch (error) {
    next(error);
  }
};

export const deleteBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const booking = await prisma.booking.findUnique({ where: { id } });
    if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
    await prisma.booking.delete({ where: { id } });
    return res.status(200).json({ success: true, message: 'Booking deleted.' });
  } catch (error) {
    next(error);
  }
};
