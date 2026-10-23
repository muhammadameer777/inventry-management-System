import React, { useState, useEffect, useCallback } from 'react';
import { 
  Plus, 
  Edit3, 
  Trash2, 
  Sparkles, 
  Cpu, 
  BookOpen, 
  Award, 
  Briefcase, 
  Trophy, 
  GraduationCap, 
  Users,
  Search,
  Calendar
} from 'lucide-react';
import { categoryService } from '../../services/categoryService';
import { eventService } from '../../services/eventService';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/common/Card';
import { Button } from '../../components/common/Button';
import { Input } from '../../components/common/Input';
import { Modal } from '../../components/common/Modal';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';

export const AdminCategoriesPage = () => {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Create / Edit Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('Sparkles');
  const [color, setColor] = useState('blue');
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Delete Dialog State
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [cats, allEvents] = await Promise.all([
        categoryService.getCategories(),
        eventService.getEvents(),
      ]);
      setCategories(cats);
      setEvents(allEvents);
    } catch (err) {
      showToast({
        title: 'Error loading categories',
        message: err.message,
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Open Create Modal
  const handleOpenCreateModal = () => {
    setEditingCategory(null);
    setName('');
    setDescription('');
    setIcon('Sparkles');
    setColor('blue');
    setErrors({});
    setModalOpen(true);
  };

  // Open Edit Modal
  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setName(cat.name || '');
    setDescription(cat.description || '');
    setIcon(cat.icon || 'Sparkles');
    setColor(cat.color || 'blue');
    setErrors({});
    setModalOpen(true);
  };

  // Form Validation
  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = 'Category name is required';
    if (!description.trim()) errs.description = 'Category description is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  // Submit Category (CREATE or UPDATE)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setSubmitting(true);
    try {
      if (editingCategory) {
        // UPDATE (CRUD Module 2)
        await categoryService.updateCategory(editingCategory.id, {
          name,
          description,
          icon,
          color,
        });
        showToast({
          title: 'Category Updated',
          message: `Category "${name}" was updated successfully.`,
          type: 'success',
        });
      } else {
        // CREATE (CRUD Module 2)
        await categoryService.createCategory({
          name,
          description,
          icon,
          color,
        });
        showToast({
          title: 'Category Created',
          message: `New track "${name}" added to the university system.`,
          type: 'success',
        });
      }

      setModalOpen(false);
      loadData();
    } catch (err) {
      showToast({
        title: 'Error Saving Category',
        message: err.message,
        type: 'error',
      });
    } finally {
      setSubmitting(false);
    }
  };

  // Open Delete Dialog
  const handleOpenDelete = (cat) => {
    setCategoryToDelete(cat);
    setDeleteDialogOpen(true);
  };

  // Confirm Delete (DELETE CRUD Module 2)
  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;
    setDeleting(true);
    try {
      await categoryService.deleteCategory(categoryToDelete.id);
      showToast({
        title: 'Category Deleted',
        message: `Category "${categoryToDelete.name}" was permanently removed.`,
        type: 'success',
      });
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
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

  const filteredCategories = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              Event Category Management
            </h2>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Create and manage the categories used to organise events.
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          icon={Plus}
          onClick={handleOpenCreateModal}
          className="shadow-md shadow-blue-500/20 self-start sm:self-auto"
        >
          Add New Category
        </Button>
      </div>

      {/* Search Input */}
      <Card className="p-4 flex items-center">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search categories by name or description..."
            className="w-full h-10 pl-10 pr-3 rounded-xl bg-slate-50 dark:bg-[#161821] border border-slate-200 dark:border-white/10 text-xs sm:text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </Card>

      {/* Categories Grid (READ) */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-40 rounded-2xl bg-white dark:bg-[#141414] animate-pulse" />
          ))}
        </div>
      ) : filteredCategories.length === 0 ? (
        <Card className="p-12 text-center space-y-3">
          <Sparkles size={24} className="text-slate-400 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            No categories found
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Create a category to begin sorting campus activities.
          </p>
          <Button size="sm" variant="secondary" onClick={handleOpenCreateModal}>
            Add Category
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredCategories.map((cat) => {
            const count = events.filter(
              (e) => e.category?.toLowerCase() === cat.name?.toLowerCase() || e.categoryId === cat.id
            ).length;

            return (
              <Card key={cat.id} className="p-5 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-500 flex items-center justify-center shrink-0">
                      <Sparkles size={18} />
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleOpenEditModal(cat)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                        title="Edit category"
                      >
                        <Edit3 size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleOpenDelete(cat)}
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
                        title="Delete category"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>

                  <div className="mt-3">
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {cat.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      {cat.description}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] text-slate-400">
                    Slug: {cat.slug}
                  </span>
                  <span className="font-semibold text-blue-500 flex items-center gap-1">
                    <Calendar size={12} />
                    {count} events linked
                  </span>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Category Create/Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingCategory ? 'Edit Category' : 'Create Event Category'}
        subtitle={editingCategory ? `Modifying track ID: ${editingCategory.id}` : 'Add a distinct category for academic and campus events'}
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Category Name"
            type="text"
            placeholder="e.g. Workshop, Seminar, Hackathon"
            value={name}
            onChange={(e) => setName(e.target.value)}
            error={errors.name}
          />

          <Input
            label="Category Description"
            isTextArea
            rows={3}
            placeholder="Explain what events fall under this campus category..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            error={errors.description}
          />

          <div className="pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-end gap-2.5">
            <Button
              variant="secondary"
              size="md"
              onClick={() => setModalOpen(false)}
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
              {editingCategory ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Delete this event category?"
        message={`Are you sure you want to delete category "${categoryToDelete?.name}"? Any events currently assigned to this category will need to be reclassified.`}
        confirmText="Delete Category"
        cancelText="Cancel"
        isDanger={true}
        loading={deleting}
      />

    </div>
  );
};
