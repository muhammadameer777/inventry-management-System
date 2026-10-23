import prisma from '../config/db.js';

const formatRequest = (r) => ({
  id: r.id,
  referenceCode: r.referenceCode,
  requesterId: r.requesterId,
  requesterName: r.requester?.name || '',
  requesterEmail: r.requester?.email || '',
  title: r.title,
  description: r.description,
  categoryId: r.categoryId,
  categoryName: r.category?.name || '',
  preferredDate: r.preferredDate,
  startTime: r.startTime || '',
  endTime: r.endTime || '',
  expectedAttendees: r.expectedAttendees,
  venue: r.venue,
  requirements: r.requirements || '',
  budget: r.budget || '',
  organizerName: r.organizerName,
  contactEmail: r.contactEmail,
  contactPhone: r.contactPhone || '',
  additionalNotes: r.additionalNotes || '',
  imageUrl: r.imageUrl || '',
  status: r.status,
  adminNote: r.adminNote || '',
  reviewedAt: r.reviewedAt,
  reviewedBy: r.reviewedBy,
  createdAt: r.createdAt,
  updatedAt: r.updatedAt,
  // If approved, include linked event ids
  eventIds: r.events?.map((e) => e.id) || [],
});

export const getAllRequests = async (req, res, next) => {
  try {
    const { status, search } = req.query;
    const where = {};

    // Non-admins can only see their own requests
    if (req.user.role !== 'ADMIN') {
      where.requesterId = req.user.id;
    }

    if (status && status !== 'all') {
      where.status = status.toUpperCase();
    }

    if (search?.trim()) {
      const q = search.trim();
      where.OR = [
        { referenceCode: { contains: q } },
        { title: { contains: q } },
        { organizerName: { contains: q } },
        { contactEmail: { contains: q } },
      ];
    }

    const requests = await prisma.eventRequest.findMany({
      where,
      include: {
        requester: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true } },
        events: { select: { id: true, title: true, status: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.status(200).json({ success: true, data: requests.map(formatRequest) });
  } catch (error) {
    next(error);
  }
};

export const getRequestById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const request = await prisma.eventRequest.findUnique({
      where: { id },
      include: {
        requester: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true } },
        events: { select: { id: true, title: true, status: true } },
      },
    });
    if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });

    // Non-admins can only access their own requests
    if (req.user.role !== 'ADMIN' && request.requesterId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    return res.status(200).json({ success: true, data: formatRequest(request) });
  } catch (error) {
    next(error);
  }
};

export const createRequest = async (req, res, next) => {
  try {
    const {
      title, description, categoryId, preferredDate, startTime, endTime,
      expectedAttendees, venue, requirements, budget, organizerName,
      contactEmail, contactPhone, additionalNotes, imageUrl,
    } = req.body;

    // Validation
    if (!title?.trim()) return res.status(400).json({ success: false, message: 'Event title is required.' });
    if (!description?.trim()) return res.status(400).json({ success: false, message: 'Event description is required.' });
    if (!preferredDate) return res.status(400).json({ success: false, message: 'Preferred date is required.' });
    if (!expectedAttendees || Number(expectedAttendees) < 1)
      return res.status(400).json({ success: false, message: 'Expected attendees must be at least 1.' });
    if (!venue?.trim()) return res.status(400).json({ success: false, message: 'Venue/location is required.' });
    if (!organizerName?.trim()) return res.status(400).json({ success: false, message: 'Organizer name is required.' });
    if (!contactEmail?.trim() || !/\S+@\S+\.\S+/.test(contactEmail))
      return res.status(400).json({ success: false, message: 'A valid contact email is required.' });

    // Validate preferredDate is in the future
    const today = new Date().toISOString().split('T')[0];
    if (preferredDate < today)
      return res.status(400).json({ success: false, message: 'Preferred date must be in the future.' });

    // Generate reference code
    const refNum = Math.floor(1000 + Math.random() * 9000);
    const referenceCode = `EVT-${refNum}`;

    const request = await prisma.eventRequest.create({
      data: {
        referenceCode,
        requesterId: req.user.id,
        title: title.trim(),
        description: description.trim(),
        categoryId: categoryId || null,
        preferredDate,
        startTime: startTime || null,
        endTime: endTime || null,
        expectedAttendees: Number(expectedAttendees),
        venue: venue.trim(),
        requirements: requirements?.trim() || null,
        budget: budget?.trim() || null,
        organizerName: organizerName.trim(),
        contactEmail: contactEmail.trim().toLowerCase(),
        contactPhone: contactPhone?.trim() || null,
        additionalNotes: additionalNotes?.trim() || null,
        imageUrl: imageUrl?.trim() || null,
        status: 'PENDING',
      },
      include: {
        requester: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true } },
        events: { select: { id: true, title: true, status: true } },
      },
    });

    return res.status(201).json({
      success: true,
      message: 'Event request submitted successfully.',
      data: formatRequest(request),
    });
  } catch (error) {
    next(error);
  }
};

export const updateRequestStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, adminNote } = req.body;

    const request = await prisma.eventRequest.findUnique({
      where: { id },
      include: { events: true },
    });
    if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });

    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED'];
    if (!validStatuses.includes(status?.toUpperCase()))
      return res.status(400).json({ success: false, message: 'Invalid status value.' });

    const newStatus = status.toUpperCase();

    const updated = await prisma.eventRequest.update({
      where: { id },
      data: {
        status: newStatus,
        adminNote: adminNote?.trim() || request.adminNote,
        reviewedAt: ['APPROVED', 'REJECTED'].includes(newStatus) ? new Date() : request.reviewedAt,
        reviewedBy: ['APPROVED', 'REJECTED'].includes(newStatus) ? req.user.name : request.reviewedBy,
      },
      include: {
        requester: { select: { id: true, name: true, email: true } },
        category: { select: { id: true, name: true } },
        events: { select: { id: true, title: true, status: true } },
      },
    });

    return res.status(200).json({
      success: true,
      message: `Request ${newStatus.toLowerCase()}.`,
      data: formatRequest(updated),
    });
  } catch (error) {
    next(error);
  }
};

export const approveAndCreateEvent = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { adminNote, capacity, ticketPrice } = req.body;

    const request = await prisma.eventRequest.findUnique({
      where: { id },
      include: {
        requester: { select: { id: true, name: true, email: true } },
        category: true,
      },
    });
    if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });
    if (request.status !== 'PENDING')
      return res.status(400).json({ success: false, message: 'Only pending requests can be approved.' });

    // Find a category to use
    let targetCategoryId = request.categoryId;
    if (!targetCategoryId) {
      const first = await prisma.category.findFirst();
      if (first) targetCategoryId = first.id;
    }

    // Create the event
    const eventTitle = request.title;
    const event = await prisma.event.create({
      data: {
        title: eventTitle,
        slug: eventTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        description: request.description,
        fullDescription: request.description,
        categoryId: targetCategoryId,
        date: request.preferredDate,
        startTime: request.startTime || '09:00 AM',
        endTime: request.endTime || '05:00 PM',
        location: request.venue,
        capacity: capacity ? Number(capacity) : request.expectedAttendees,
        organizer: request.organizerName,
        status: 'PUBLISHED',
        ticketPrice: ticketPrice ? Number(ticketPrice) : 0,
        eventRequestId: request.id,
      },
    });

    // Update request to approved and link event
    await prisma.eventRequest.update({
      where: { id },
      data: {
        status: 'APPROVED',
        adminNote: adminNote?.trim() || null,
        reviewedAt: new Date(),
        reviewedBy: req.user.name,
      },
    });

    return res.status(200).json({
      success: true,
      message: 'Request approved and event created.',
      eventId: event.id,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteRequest = async (req, res, next) => {
  try {
    const { id } = req.params;
    const request = await prisma.eventRequest.findUnique({ where: { id } });
    if (!request) return res.status(404).json({ success: false, message: 'Request not found.' });

    // Only admin or requester can delete
    if (req.user.role !== 'ADMIN' && request.requesterId !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    await prisma.eventRequest.delete({ where: { id } });
    return res.status(200).json({ success: true, message: 'Request deleted.' });
  } catch (error) {
    next(error);
  }
};
