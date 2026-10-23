import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Search, 
  Edit3, 
  Trash2, 
  Calendar, 
  Clock, 
  MapPin, 
  Users, 
  Eye, 
  AlertCircle,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { eventService } from '../../services/eventService';
import { categoryService } from '../../services/categoryService';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/common/Card';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const AdminEventsPage = () => {
  const { showToast } = useToast();
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');

  // Form Modal (Create / Edit)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    fullDescription: '',
    category: 'Workshop',
    date: '',
    startTime: '10:00 AM',
    endTime: '12:00 PM',
    location: '',
    capacity: 100,
    organizer: '',
    coverImage: '',
    status: 'Published',
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Delete Confirmation Dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [eventsList, catsList] = await Promise.all([
        eventService.getEvents({ search, category: categoryFilter }),
        categoryService.getCategories(),
      ]);
      setEvents(eventsList);
      setCategories(catsList);
    } catch (err) {
      showToast({
        title: 'Error loading events',
        message: err.message,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [search, categoryFilter, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Handle open Create Modal
  const handleOpenCreateModal = () => {
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      fullDescription: '',
      category: categories[0]?.name || 'Seminar',
      date: new Date(Date.now() + 86400000 * 7).toISOString().split('T')[0],
      startTime: '10:00 AM',
      endTime: '01:00 PM',
      location: 'University Innovation Hall, Room 204',
      capacity: 100,
      organizer: 'Department of Computer Science',
      coverImage: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200',
      status: 'Published',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Handle open Edit Modal
  const handleOpenEditModal = (event) => {
    setEditingEvent(event);
    setFormData({
      title: event.title || '',
      description: event.description || '',
      fullDescription: event.fullDescription || event.description || '',
      category: event.category || 'Seminar',
      date: event.date || '',
      startTime: event.startTime || '10:00 AM',
      endTime: event.endTime || '12:00 PM',
      location: event.location || '',
      capacity: event.capacity || 50,
      organizer: event.organizer || '',
      coverImage: event.coverImage || '',
      status: event.status || 'Published',
    });
    setFormErrors({});
    setIsModalOpen(true);
  };

  // Validate form fields
  const validateForm = () => {
    const errs = {};
    if (!formData.title.trim()) errs.title = 'Event title is required';
    if (!formData.description.trim()) errs.description = 'Short description is required';
    if (!formData.date) errs.date = 'Event date is required';
    if (!formData.location.trim()) errs.location = 'Venue/location is required';
    if (!formData.organizer.trim()) errs.organizer = 'Organizer name is required';
    if (!formData.capacity || Number(formData.capacity) <= 0) {
      errs.capacity = 'Capacity must be greater than zero';
    }
    setFormErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit form (Create or Update)
  const handleSubmitForm = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setSubmitting(true);
    try {
      if (editingEvent) {
        // UPDATE (CRUD Module 1)
        await eventService.updateEvent(editingEvent.id, {
          ...formData,
          capacity: Number(formData.capacity),
        });
        showToast({
          title: 'Event Updated',
          message: `"${formData.title}" has been saved.`,
          type: 'success',
        });
      } else {
        // CREATE (CRUD Module 1)
        await eventService.createEvent({
          ...formData,
          capacity: Number(formData.capacity),
        });
        showToast({
          title: 'Event Created',
          message: `"${formData.title}" was published to campus catalog.`,
          type: 'success',
        });
      }

      setIsModalOpen(false);
      loadData();
    } catch (err) {
      showToast({
        title: 'Error Saving Event',
        message: err.message,
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Open Delete Dialog
  const handleOpenDeleteDialog = (event) => {
    setEventToDelete(event);
    setDeleteDialogOpen(true);
  };

  // Confirm Delete (CRUD Module 1)
  const handleConfirmDelete = async () => {
    if (!eventToDelete) return;
    setDeleting(true);
    try {
      await eventService.deleteEvent(eventToDelete.id);
      showToast({
        title: 'Event Deleted',
        message: `Event "${eventToDelete.title}" has been removed.`,
        type: 'success',
      });
      setDeleteDialogOpen(false);
      setEventToDelete(null);
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
      
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Event Management
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Create and update events, or remove events that are no longer needed.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={handleOpenCreateModal}
          className="shadow-md shadow-blue-500/20 self-start sm:self-auto"
        >
          Add New Event
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
            placeholder="Search events by title, organizer, or venue..."
            className="w-full h-10 pl-10 pr-3 rounded-xl bg-slate-50 dark:bg-[#161821] border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="h-10 px-3 rounded-xl bg-slate-50 dark:bg-[#161821] border border-slate-200 dark:border-white/10 text-xs text-slate-700 dark:text-slate-300 outline-none w-full sm:w-auto"
        >
          <option value="all">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </Card>

      {/* Events Table (READ) */}
      <Card className="overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-14 bg-slate-100 dark:bg-white/5 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <AlertCircle size={28} className="text-slate-400 mx-auto" />
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              No events found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              No matching events in the database. Create a new event to populate the records.
            </p>
            <Button size="sm" variant="secondary" onClick={handleOpenCreateModal}>
              Create Event
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 dark:bg-white/[0.02] text-slate-500 uppercase tracking-wider text-[10px] border-b border-slate-100 dark:border-white/5 font-semibold">
                <tr>
                  <th className="py-3.5 px-6">Event Details</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Schedule</th>
                  <th className="py-3.5 px-6">Capacity</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                {events.map((evt) => (
                  <tr key={evt.id} className="hover:bg-slate-50/50 dark:hover:bg-white/[0.01] transition-colors">
                    
                    {/* Title & Organizer */}
                    <td className="py-4 px-6 max-w-xs">
                      <div className="flex items-center gap-3">
                        <img
                          src={evt.coverImage}
                          alt={evt.title}
                          className="w-10 h-10 rounded-xl object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <h4 className="font-semibold text-slate-900 dark:text-white truncate">
                            {evt.title}
                          </h4>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate block">
                            {evt.organizer} • {evt.location}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-6">
                      <Badge variant="primary" size="sm">
                        {evt.category}
                      </Badge>
                    </td>

                    {/* Schedule */}
                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300">
                      <div>{evt.date}</div>
                      <div className="text-[10px] text-slate-400">{evt.startTime} - {evt.endTime}</div>
                    </td>

                    {/* Capacity */}
                    <td className="py-4 px-6">
                      <div className="font-medium text-slate-800 dark:text-slate-200">
                        {evt.registeredCount || 0} / {evt.capacity}
                      </div>
                      <div className="w-20 h-1.5 bg-slate-100 dark:bg-white/5 rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full bg-blue-500 rounded-full"
                          style={{
                            width: `${Math.min(100, Math.round(((evt.registeredCount || 0) / (evt.capacity || 1)) * 100))}%`,
                          }}
                        />
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-6">
                      <Badge
                        variant={evt.status === 'Published' ? 'success' : 'default'}
                        size="sm"
                        dot
                      >
                        {evt.status || 'Published'}
                      </Badge>
                    </td>

                    {/* Actions (UPDATE, DELETE) */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleOpenEditModal(evt)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-950/30 transition-colors"
                          title="Edit event details"
                        >
                          <Edit3 size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleOpenDeleteDialog(evt)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors"
                          title="Delete event"
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

      {/* Create / Edit Modal (CREATE & UPDATE) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingEvent ? 'Edit Event Details' : 'Create New Campus Event'}
        subtitle={editingEvent ? `Updating event ID: ${editingEvent.id}` : 'Provide university schedule and venue specifications'}
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmitForm} className="space-y-4">
          <Input
            label="Event Title"
            type="text"
            placeholder="e.g. Next-Gen Generative AI Symposium"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            error={formErrors.title}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1 text-xs">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Academic Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-white dark:bg-[#161821] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 text-xs"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1 text-xs">
              <label className="font-semibold text-slate-700 dark:text-slate-300">
                Publication Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                className="w-full h-10 px-3 rounded-xl bg-white dark:bg-[#161821] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20 text-xs"
              >
                <option value="Published">Published (Open for registration)</option>
                <option value="Draft">Draft (Internal review only)</option>
                <option value="Archived">Archived</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Input
              label="Date"
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              error={formErrors.date}
            />

            <Input
              label="Start Time"
              type="text"
              placeholder="10:00 AM"
              value={formData.startTime}
              onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
            />

            <Input
              label="End Time"
              type="text"
              placeholder="01:00 PM"
              value={formData.endTime}
              onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Campus Location / Auditorium"
              type="text"
              placeholder="Alan Turing Hall, Room 101"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              error={formErrors.location}
            />

            <Input
              label="Maximum Seating Capacity"
              type="number"
              min="1"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
              error={formErrors.capacity}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Department / Hosting Club"
              type="text"
              placeholder="Dept of Computer Science & ACM"
              value={formData.organizer}
              onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
              error={formErrors.organizer}
            />

            <Input
              label="Cover Image URL"
              type="text"
              placeholder="https://images.unsplash.com/..."
              value={formData.coverImage}
              onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
            />
          </div>

          <Input
            label="Brief Summary"
            isTextArea
            rows={2}
            placeholder="One or two sentences explaining the event overview..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            error={formErrors.description}
          />

          <Input
            label="Full Detailed Description"
            isTextArea
            rows={3}
            placeholder="Comprehensive description, speaker background, agenda..."
            value={formData.fullDescription}
            onChange={(e) => setFormData({ ...formData, fullDescription: e.target.value })}
          />

          <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-end gap-2.5">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setIsModalOpen(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={submitting}
            >
              {editingEvent ? 'Save Changes' : 'Publish Event'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog (DELETE) */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete this event?"
        message={`Are you sure you want to permanently delete "${eventToDelete?.title}"? All associated student registrations will also be affected. This action cannot be undone.`}
        confirmText="Delete Event"
        cancelText="Cancel"
        isDanger={true}
        loading={deleting}
      />

    </div>
  );
};
