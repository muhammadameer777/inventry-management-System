import prisma from '../config/db.js';

export const getAllUsers = async (req, res, next) => {
  try {
    const { search, role } = req.query;
    const where = {};

    if (role && role !== 'all') {
      where.role = role.toUpperCase();
    }

    if (search?.trim()) {
      const q = search.trim();
      where.OR = [
        { name: { contains: q } },
        { email: { contains: q } },
        { organization: { contains: q } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        organization: true,
        bio: true,
        createdAt: true,
        _count: { select: { bookings: true, eventRequests: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const formatted = users.map((u) => ({
      id: u.id,
      name: u.name,
      email: u.email,
      role: u.role,
      phone: u.phone,
      organization: u.organization,
      bio: u.bio,
      bookingCount: u._count.bookings,
      requestCount: u._count.eventRequests,
      createdAt: u.createdAt,
    }));

    return res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true, name: true, email: true, role: true,
        phone: true, organization: true, bio: true, createdAt: true,
        _count: { select: { bookings: true, eventRequests: true } },
      },
    });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    const validRoles = ['USER', 'ORGANIZER', 'ADMIN'];
    if (!validRoles.includes(role?.toUpperCase()))
      return res.status(400).json({ success: false, message: 'Invalid role.' });

    // Prevent self-demotion
    if (id === req.user.id)
      return res.status(400).json({ success: false, message: 'Cannot change your own role.' });

    const updated = await prisma.user.update({
      where: { id },
      data: { role: role.toUpperCase() },
      select: { id: true, name: true, email: true, role: true },
    });
    return res.status(200).json({ success: true, message: 'User role updated.', data: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (id === req.user.id)
      return res.status(400).json({ success: false, message: 'Cannot delete your own account.' });

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    await prisma.user.delete({ where: { id } });
    return res.status(200).json({ success: true, message: 'User deleted.' });
  } catch (error) {
    next(error);
  }
};

export const getAdminStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalEvents,
      publishedEvents,
      totalBookings,
      confirmedBookings,
      pendingRequests,
      totalRequests,
    ] = await Promise.all([
      prisma.user.count({ where: { role: { not: 'ADMIN' } } }),
      prisma.event.count(),
      prisma.event.count({ where: { status: 'PUBLISHED' } }),
      prisma.booking.count(),
      prisma.booking.count({ where: { status: 'CONFIRMED' } }),
      prisma.eventRequest.count({ where: { status: 'PENDING' } }),
      prisma.eventRequest.count(),
    ]);

    // Calculate revenue from confirmed/checked-in bookings
    const revenueData = await prisma.booking.aggregate({
      where: { status: { in: ['CONFIRMED', 'CHECKED_IN'] } },
      _sum: { totalAmount: true },
    });
    const totalRevenue = revenueData._sum.totalAmount || 0;

    // Upcoming events count
    const today = new Date().toISOString().split('T')[0];
    const upcomingEvents = await prisma.event.count({
      where: { status: 'PUBLISHED', date: { gte: today } },
    });

    // Recent bookings
    const recentBookings = await prisma.booking.findMany({
      take: 5,
      orderBy: { bookingDate: 'desc' },
      include: {
        user: { select: { name: true, email: true } },
        event: { select: { title: true } },
      },
    });

    // Recent event requests
    const recentRequests = await prisma.eventRequest.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { requester: { select: { name: true, email: true } } },
    });

    return res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalEvents,
        publishedEvents,
        upcomingEvents,
        totalBookings,
        confirmedBookings,
        pendingRequests,
        totalRequests,
        totalRevenue,
        recentBookings: recentBookings.map((b) => ({
          id: b.id,
          referenceCode: b.referenceCode,
          userName: b.user?.name,
          eventTitle: b.event?.title,
          status: b.status,
          bookingDate: b.bookingDate,
        })),
        recentRequests: recentRequests.map((r) => ({
          id: r.id,
          referenceCode: r.referenceCode,
          title: r.title,
          requesterName: r.requester?.name,
          status: r.status,
          createdAt: r.createdAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};
