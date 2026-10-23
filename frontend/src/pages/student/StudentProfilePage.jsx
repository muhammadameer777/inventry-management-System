import React, { useState } from 'react';
import { User, Mail, Hash, BookOpen, GraduationCap, Phone, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { Card } from '../../components/common/Card';
import { Input } from '../../components/common/Input';
import { Button } from '../../components/common/Button';

export const StudentProfilePage = () => {
  const { currentUser, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [name, setName] = useState(currentUser?.name || '');
  const [email] = useState(currentUser?.email || '');
  const [studentId] = useState(currentUser?.studentId || 'CE-2026-8841');
  const [major, setMajor] = useState(currentUser?.major || 'Computer Science & Software Engineering');
  const [phone, setPhone] = useState(currentUser?.phone || '+1 (555) 892-4100');
  const [year, setYear] = useState(currentUser?.year || 'Year 3 (Junior)');
  const [saving, setSaving] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile({
        name,
        major,
        contact: phone,
        academicYear: year,
      });
      showToast({
        title: 'Profile Saved',
        message: 'Your student information has been updated in the database.',
        type: 'success',
      });
    } catch (err) {
      showToast({
        title: 'Failed to update profile',
        message: err.message || 'Please try again',
        type: 'error',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div>
        <h2 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
          Student Profile & Credentials
        </h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Manage your verified university identity and contact details for event check-in.
        </p>
      </div>

      <Card className="p-6 sm:p-8 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-white/5">
          <img
            src={currentUser?.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=256'}
            alt={currentUser?.name}
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-blue-500/20"
          />
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {currentUser?.name}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Verified Undergraduate Student • ID: {studentId}
            </p>
            <div className="inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-500/20">
              <CheckCircle2 size={11} />
              Good Standing
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Full Legal Name"
            type="text"
            icon={User}
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <Input
            label="University Email (Fixed)"
            type="email"
            icon={Mail}
            value={email}
            disabled
            helperText="Assigned by the university registrar Office."
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Student ID"
              type="text"
              icon={Hash}
              value={studentId}
              disabled
            />

            <Input
              label="Academic Year"
              type="text"
              icon={GraduationCap}
              value={year}
              onChange={(e) => setYear(e.target.value)}
            />
          </div>

          <Input
            label="Declared Major / Concentration"
            type="text"
            icon={BookOpen}
            value={major}
            onChange={(e) => setMajor(e.target.value)}
          />

          <Input
            label="Mobile Phone for SMS Alerts"
            type="text"
            icon={Phone}
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex justify-end">
            <Button
              type="submit"
              variant="primary"
              size="md"
              loading={saving}
            >
              Save Profile Changes
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};
