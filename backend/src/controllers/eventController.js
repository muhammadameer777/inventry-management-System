import prisma from '../config/db.js';

const formatEvent = (e) => ({
  id: e.id,
  title: e.title,
  slug: e.slug || e.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
  description: e.description,
  fullDescription: e.fullDescription || e.description,
  categoryId: e.categoryId,
  category: e.category?.name || 'General',
  categorySlug: e.category?.slug || 'general',
  date: e.date,
  startTime: e.startTime,
  endTime: e.endTime,
  location: e.location,
  capacity: e.capacity,
  organizer: e.organizer,
  coverImage: e.image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200',
  image: e.image,
  status: e.status,
  ticketPrice: e.ticketPrice ?? 0,
  requiresApproval: e.requiresApproval ?? false,
  eventRequestId: e.eventRequestId || null,
  registeredCount: e._count?.bookings ?? 0,
  createdAt: e.createdAt,
  updatedAt: e.updatedAt,
});

export const getAllEvents = async (req, res, next) => {
  try {
    const { search, category, sort = 'date-asc', date, status } = req.query;
    const where = {};

    // Public route: only show published events unless admin
    const isAdmin = req.user?.role === 'ADMIN';
    if (!isAdmin) {
      where.status = 'PUBLISHED';
    } else if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    if (search?.trim()) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { location: { contains: q } },
        { organizer: { contains: q } },
      ];
    }

    if (category && category !== 'all') {
      where.category = {
        OR: [
          { name: { equals: category } },
          { slug: { equals: category.toLowerCase() } },
          { id: { equals: category } },
        ],
      };
    }

    if (date) where.date = date;

    let orderBy = { date: 'asc' };
    if (sort === 'date-desc') orderBy = { date: 'desc' };
    else if (sort === 'title-asc') orderBy = { title: 'asc' };
    else if (sort === 'capacity-desc') orderBy = { capacity: 'desc' };

    const events = await prisma.event.findMany({
      where,
      include: {
        category: true,
        _count: { select: { bookings: { where: { status: { not: 'CANCELLED' } } } } },
      },
      orderBy,
    });

    const formatted = events.map(formatEvent);
    if (sort === 'popularity') formatted.sort((a, b) => b.registeredCount - a.registeredCount);

    return res.status(200).json({ success: true, data: formatted });
  } catch (error) {
    next(error);
  }
};

export const getEventById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        category: true,
        _count: { select: { bookings: { where: { status: { not: 'CANCELLED' } } } } },
      },
    });

    if (!event) return res.status(404).json({ success: false, message: 'Event not found.' });

    // Non-admins can only view published events
    if (event.status !== 'PUBLISHED' && req.user?.role !== 'ADMIN') {
      return res.status(404).json({ success: false, message: 'Event not found.' });
    }

    return res.status(200).json({ success: true, data: formatEvent(event) });
  } catch (error) {
    next(error);
  }
};

export const createEvent = async (req, res, next) => {
  try {
    const {
      title, description, fullDescription, categoryId, category: categoryName,
      date, startTime, endTime, location, capacity, organizer,
      coverImage, image, status, ticketPrice, requiresApproval, eventRequestId,
    } = req.body;

    if (!title?.trim()) return res.status(400).json({ success: false, message: 'Event title is required.' });
    if (!description?.trim()) return res.status(400).json({ success: false, message: 'Event description is required.' });
    if (!date) return res.status(400).json({ success: false, message: 'Event date is required.' });
    if (!location?.trim()) return res.status(400).json({ success: false, message: 'Venue/location is required.' });
    if (!capacity || Number(capacity) <= 0)
      return res.status(400).json({ success: false, message: 'Capacity must be greater than zero.' });

    let targetCategoryId = categoryId;
    if (!targetCategoryId && categoryName) {
      const cat = await prisma.category.findFirst({
        where: { OR: [{ name: categoryName }, { slug: categoryName.toLowerCase() }] },
      });
      if (cat) targetCategoryId = cat.id;
    }
    if (!targetCategoryId) {
      const first = await prisma.category.findFirst();
      if (!first) return res.status(400).json({ success: false, message: 'No categories available. Create one first.' });
      targetCategoryId = first.id;
    }

    // Validate status values
    const validStatuses = ['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'];
    const eventStatus = validStatuses.includes(status?.toUpperCase()) ? status.toUpperCase() : 'PUBLISHED';

    const created = await prisma.event.create({
      data: {
        title: title.trim(),
        slug: title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: description.trim(),
        fullDescription: fullDescription?.trim() || description.trim(),
        categoryId: targetCategoryId,
        date,
        startTime: startTime || '09:00 AM',
        endTime: endTime || '05:00 PM',
        location: location.trim(),
        capacity: Number(capacity),
        organizer: organizer?.trim() || req.user.name,
        image: coverImage || image || null,
        status: eventStatus,
        ticketPrice: ticketPrice ? Number(ticketPrice) : 0,
        requiresApproval: requiresApproval === true || requiresApproval === 'true',
        eventRequestId: eventRequestId || null,
      },
      include: { category: true, _count: { select: { bookings: true } } },
    });

    return res.status(201).json({ success: true, message: 'Event created successfully.', data: formatEvent(created) });
  } catch (error) {
    next(error);
  }
};

export const updateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      title, description, fullDescription, categoryId, category: categoryName,
      date, startTime, endTime, location, capacity, organizer,
      coverImage, image, status, ticketPrice, requiresApproval,
    } = req.body;

    const existing = await prisma.event.findUnique({ where: { id } });
    if (!existing) return res.status(404).json({ success: false, message: 'Event not found.' });

    let targetCategoryId = categoryId;
    if (!targetCategoryId && categoryName) {
      const cat = await prisma.category.findFirst({
        where: { OR: [{ name: categoryName }, { slug: categoryName.toLowerCase() }] },
      });
      if (cat) targetCategoryId = cat.id;
    }

    const validStatuses = ['DRAFT', 'PUBLISHED', 'CANCELLED', 'COMPLETED'];

    const updated = await prisma.event.update({
      where: { id },
      data: {
        ...(title ? { title: title.trim(), slug: title.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') } : {}),
        ...(description ? { description: description.trim() } : {}),
        ...(fullDescription !== undefined ? { fullDescription: fullDescription?.trim() } : {}),
        ...(targetCategoryId ? { categoryId: targetCategoryId } : {}),
        ...(date ? { date } : {}),
        ...(startTime ? { startTime } : {}),
        ...(endTime ? { endTime } : {}),
        ...(location ? { location: location.trim() } : {}),
        ...(capacity ? { capacity: Number(capacity) } : {}),
        ...(organizer ? { organizer: organizer.trim() } : {}),
        ...(coverImage || image ? { image: coverImage || image } : {}),
        ...(status && validStatuses.includes(status.toUpperCase()) ? { status: status.toUpperCase() } : {}),
        ...(ticketPrice !== undefined ? { ticketPrice: Number(ticketPrice) } : {}),
        ...(requiresApproval !== undefined ? { requiresApproval: Boolean(requiresApproval) } : {}),
      },
      include: { category: true, _count: { select: { bookings: { where: { status: { not: 'CANCELLED' } } } } } },
    });

    return res.status(200).json({ success: true, message: 'Event updated.', data: formatEvent(updated) });
  } catch (error) {
    next(error);
  }
};

export const deleteEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const existing = await prisma.event.findUnique({ where: { id }, select: { id: true, title: true } });
    if (!existing) return res.status(404).json({ success: false, message: 'Event not found.' });

    await prisma.event.delete({ where: { id } });
    return res.status(200).json({ success: true, message: `Event "${existing.title}" deleted.` });
  } catch (error) {
    next(error);
  }
};
