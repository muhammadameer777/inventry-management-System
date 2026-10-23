import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, MapPin, Users, Mail, Phone, FileText,
  DollarSign, Clock, Send, ArrowLeft, CheckCircle2
} from 'lucide-react';
import { eventRequestService } from '../../services/eventRequestService';
import { categoryService } from '../../services/categoryService';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Button } from '../../components/common/Button';
import { Card } from '../../components/common/Card';
import { useEffect } from 'react';

const Field = ({ label, required, children, hint }) => (
  <div className="space-y-1">
    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    {children}
    {hint && <p className="text-[10px] text-slate-400">{hint}</p>}
  </div>
);

const inputCls = "w-full h-10 px-3 rounded-xl bg-white dark:bg-[#161821] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors placeholder-slate-400";
const textareaCls = "w-full p-3 rounded-xl bg-white dark:bg-[#161821] border border-slate-200 dark:border-white/10 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-colors resize-none placeholder-slate-400";

export const SubmitEventRequestPage = () => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(null);
  const [errors, setErrors] = useState({});

  const [form, setForm] = useState({
    title: '',
    description: '',
    categoryId: '',
    preferredDate: '',
    startTime: '',
    endTime: '',
    expectedAttendees: '',
    venue: '',
    requirements: '',
    budget: '',
    organizerName: currentUser?.name || '',
    contactEmail: currentUser?.email || '',
    contactPhone: currentUser?.phone || '',
    additionalNotes: '',
  });

  useEffect(() => {
    categoryService.getCategories().then(setCategories).catch(() => {});
  }, []);

  const set = (key) => (e) => {
    setForm((p) => ({ ...p, [key]: e.target.value }));
    if (errors[key]) setErrors((p) => ({ ...p, [key]: null }));
  };

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) errs.title = 'Event title is required.';
    if (!form.description.trim()) errs.description = 'Description is required.';
    if (!form.preferredDate) errs.preferredDate = 'Preferred date is required.';
    else {
      const today = new Date().toISOString().split('T')[0];
      if (form.preferredDate < today) errs.preferredDate = 'Date must be in the future.';
    }
    if (!form.expectedAttendees || Number(form.expectedAttendees) < 1)
      errs.expectedAttendees = 'Expected attendees must be at least 1.';
    if (!form.venue.trim()) errs.venue = 'Venue is required.';
    if (!form.organizerName.trim()) errs.organizerName = 'Organizer name is required.';
    if (!form.contactEmail.trim() || !/\S+@\S+\.\S+/.test(form.contactEmail))
      errs.contactEmail = 'A valid contact email is required.';
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);
    try {
      const res = await eventRequestService.submitRequest({
        ...form,
        expectedAttendees: Number(form.expectedAttendees),
        categoryId: form.categoryId || undefined,
      });
      setSubmitted(res.data);
      showToast({ title: 'Request Submitted', message: 'Your event request is under review.', type: 'success' });
    } catch (err) {
      showToast({ title: 'Submission Failed', message: err.message, type: 'error' });
    } finally {
      setSubmitting(false);
    }
  };

  // Success state
  if (submitted) {
    return (
      <div className="max-w-lg mx-auto py-16 text-center space-y-6">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/50 flex items-center justify-center mx-auto">
          <CheckCircle2 size={32} className="text-emerald-500" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Request Submitted!</h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Your event request has been submitted successfully and is now pending admin review.
          </p>
        </div>
        <Card className="p-6 text-left space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">Reference ID</span>
            <span className="font-mono font-bold text-slate-900 dark:text-white">{submitted.referenceCode}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">Event Title</span>
            <span className="font-semibold text-slate-900 dark:text-white">{submitted.title}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-500 dark:text-slate-400">Status</span>
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400">
              PENDING REVIEW
            </span>
          </div>
        </Card>
        <div className="flex gap-3 justify-center">
          <Button variant="secondary" onClick={() => navigate('/my-requests')}>
            View My Requests
          </Button>
          <Button variant="primary" onClick={() => { setSubmitted(null); setForm({ ...form, title: '', description: '' }); }}>
            Submit Another
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto pb-12">
      <div className="mb-8">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white mb-4 transition-colors"
        >
          <ArrowLeft size={14} /> Back
        </button>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Submit Event Request</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Fill in the details below. An admin will review your request and notify you of the decision.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Event Details */}
        <Card className="p-6 space-y-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/5 pb-3">
            Event Details
          </h3>

          <Field label="Event Title" required>
            <input type="text" value={form.title} onChange={set('title')} placeholder="e.g. Annual Tech Innovation Summit" className={inputCls} />
            {errors.title && <p className="text-xs text-rose-500 mt-1">{errors.title}</p>}
          </Field>

          <Field label="Category">
            <select value={form.categoryId} onChange={set('categoryId')} className={inputCls}>
              <option value="">Select a category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>

          <Field label="Description" required>
            <textarea value={form.description} onChange={set('description')} rows={4} placeholder="Describe the event, its purpose, and what attendees can expect..." className={textareaCls} />
            {errors.description && <p className="text-xs text-rose-500 mt-1">{errors.description}</p>}
          </Field>
        </Card>

        {/* Date & Venue */}
        <Card className="p-6 space-y-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/5 pb-3">
            Date & Venue
          </h3>

          <Field label="Preferred Date" required>
            <input type="date" value={form.preferredDate} onChange={set('preferredDate')} className={inputCls} />
            {errors.preferredDate && <p className="text-xs text-rose-500 mt-1">{errors.preferredDate}</p>}
          </Field>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Start Time">
              <input type="time" value={form.startTime} onChange={set('startTime')} className={inputCls} />
            </Field>
            <Field label="End Time">
              <input type="time" value={form.endTime} onChange={set('endTime')} className={inputCls} />
            </Field>
          </div>

          <Field label="Venue / Location" required>
            <input type="text" value={form.venue} onChange={set('venue')} placeholder="e.g. Main Auditorium, Building A" className={inputCls} />
            {errors.venue && <p className="text-xs text-rose-500 mt-1">{errors.venue}</p>}
          </Field>

          <Field label="Expected Number of Attendees" required>
            <input type="number" min="1" value={form.expectedAttendees} onChange={set('expectedAttendees')} placeholder="e.g. 200" className={inputCls} />
            {errors.expectedAttendees && <p className="text-xs text-rose-500 mt-1">{errors.expectedAttendees}</p>}
          </Field>
        </Card>

        {/* Requirements & Budget */}
        <Card className="p-6 space-y-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/5 pb-3">
            Requirements & Budget (Optional)
          </h3>

          <Field label="Event Requirements / Special Needs" hint="e.g. AV equipment, catering, parking, security...">
            <textarea value={form.requirements} onChange={set('requirements')} rows={2} placeholder="Describe any special requirements or resources needed..." className={textareaCls} />
          </Field>

          <Field label="Estimated Budget" hint="Approximate budget in USD or state 'No budget required'">
            <input type="text" value={form.budget} onChange={set('budget')} placeholder="e.g. $2,000 or Free event" className={inputCls} />
          </Field>
        </Card>

        {/* Contact Info */}
        <Card className="p-6 space-y-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white border-b border-slate-100 dark:border-white/5 pb-3">
            Organizer & Contact Information
          </h3>

          <Field label="Organizer / Organization Name" required>
            <input type="text" value={form.organizerName} onChange={set('organizerName')} placeholder="Your name or organization" className={inputCls} />
            {errors.organizerName && <p className="text-xs text-rose-500 mt-1">{errors.organizerName}</p>}
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Contact Email" required>
              <input type="email" value={form.contactEmail} onChange={set('contactEmail')} placeholder="email@example.com" className={inputCls} />
              {errors.contactEmail && <p className="text-xs text-rose-500 mt-1">{errors.contactEmail}</p>}
            </Field>
            <Field label="Contact Phone">
              <input type="tel" value={form.contactPhone} onChange={set('contactPhone')} placeholder="+1 (555) 000-0000" className={inputCls} />
            </Field>
          </div>

          <Field label="Additional Notes">
            <textarea value={form.additionalNotes} onChange={set('additionalNotes')} rows={2} placeholder="Any other relevant information..." className={textareaCls} />
          </Field>
        </Card>

        {/* Submit */}
        <div className="flex gap-3 justify-end">
          <Button type="button" variant="secondary" onClick={() => navigate('/my-requests')}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" loading={submitting}>
            <Send size={14} className="mr-2" /> Submit Request
          </Button>
        </div>
      </form>
    </div>
  );
};
