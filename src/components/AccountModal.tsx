import React, { useState, useEffect } from 'react';
import { UserProfile, EducationType } from '../types';
import { getTrustTier } from '../seedData';

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onSaveUser: (updatedUser: UserProfile) => void;
  onLogout?: () => void;
  onShowToast: (msg: string) => void;
}

const COMMON_ENGINEERING_MAJORS = [
  'Computer Science & Engineering',
  'Mechanical Engineering',
  'Electrical & Electronics Engineering',
  'Electronics & Communication Engineering',
  'Civil Engineering',
  'Chemical Engineering',
  'Aerospace Engineering',
  'Biotechnology',
  'Information Technology',
  'Other Engineering Discipline',
];

const PUC_STREAMS = [
  'Science - PCMB (Physics, Chem, Math, Bio)',
  'Science - PCMC (Physics, Chem, Math, Comp Sci)',
  'Science - PCME (Physics, Chem, Math, Electronics)',
  'Commerce (Accountancy, Business Studies, Economics, Math/Stats)',
  'Arts / Humanities',
];

export const AccountModal: React.FC<AccountModalProps> = ({
  isOpen,
  onClose,
  user,
  onSaveUser,
  onLogout,
  onShowToast,
}) => {
  const [formData, setFormData] = useState<UserProfile>({ ...user });
  const [otpCode, setOtpCode] = useState('');
  const [showOtpDemo, setShowOtpDemo] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData({ ...user });
      setShowOtpDemo(false);
      setOtpCode('');
    }
  }, [user, isOpen]);

  if (!isOpen) return null;

  const handleEducationTypeChange = (type: EducationType) => {
    if (type === 'PUC') {
      const validPucYears = ['1st Year (PUC I)', '2nd Year (PUC II)'];
      const defaultYear = validPucYears.includes(formData.yearOfStudy) ? formData.yearOfStudy : '1st Year (PUC I)';
      setFormData(prev => ({
        ...prev,
        educationType: 'PUC',
        yearOfStudy: defaultYear,
        major: PUC_STREAMS[0],
      }));
    } else {
      const validEngYears = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Postgraduate'];
      const defaultYear = validEngYears.includes(formData.yearOfStudy) ? formData.yearOfStudy : '2nd Year';
      setFormData(prev => ({
        ...prev,
        educationType: 'Engineering',
        yearOfStudy: defaultYear,
        major: COMMON_ENGINEERING_MAJORS[0],
      }));
    }
  };

  const handleSendEmailOtp = () => {
    if (!formData.email.includes('@')) {
      onShowToast('Please provide a valid college email address.');
      return;
    }
    setShowOtpDemo(true);
    onShowToast(`Demo OTP code "8241" sent to ${formData.email}`);
  };

  const handleVerifyOtp = () => {
    if (otpCode.trim() === '8241') {
      const updatedScore = Math.min(100, (formData.emailVerified ? formData.trustScore : formData.trustScore + 20));
      const updatedUser: UserProfile = {
        ...formData,
        emailVerified: true,
        trustScore: updatedScore,
      };
      setFormData(updatedUser);
      onSaveUser(updatedUser);
      setShowOtpDemo(false);
      onShowToast('🎉 College email verified! +20 Trust Score added to your account.');
    } else {
      onShowToast('Incorrect OTP. For this demo, use code: 8241');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      onShowToast('Name is required.');
      return;
    }
    if (!formData.mobile.trim()) {
      onShowToast('Mobile number is required for contact and verification.');
      return;
    }
    onSaveUser(formData);
    onShowToast('Profile details updated successfully.');
    onClose();
  };

  const currentTier = getTrustTier(formData.trustScore);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg shadow-xl my-8 overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
              Student Profile & Verification
            </h2>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Contact info, academic stream, and campus trust status
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 text-xl font-mono leading-none p-1 cursor-pointer"
            aria-label="Close profile"
          >
            ✕
          </button>
        </div>

        {/* Trust Score Banner */}
        <div className="px-5 py-3.5 bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 dark:text-zinc-400">Current Status:</span>
            <span className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">
              {currentTier} Tier
            </span>
            <span className="text-xs text-zinc-400">·</span>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
              Score: {formData.trustScore}/100
            </span>
          </div>

          {!formData.emailVerified ? (
            <button
              type="button"
              onClick={handleSendEmailOtp}
              className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
            >
              Verify .edu Email (+20 Pts)
            </button>
          ) : (
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              ✓ College ID Verified
            </span>
          )}
        </div>

        {/* Demo OTP Box */}
        {showOtpDemo && (
          <div className="p-4 mx-5 my-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-md">
            <div className="text-xs text-blue-900 dark:text-blue-200 font-medium mb-1.5">
              Demo OTP Verification (Code: 8241)
            </div>
            <div className="text-xs text-blue-700 dark:text-blue-300 mb-2">
              Enter the demo code sent to {formData.email} to verify your student status.
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                maxLength={4}
                value={otpCode}
                onChange={e => setOtpCode(e.target.value)}
                placeholder="8241"
                className="w-28 px-3 py-1.5 text-sm font-mono tracking-widest bg-white dark:bg-zinc-900 border border-blue-300 dark:border-blue-700 rounded text-center focus:outline-blue-500"
              />
              <button
                type="button"
                onClick={handleVerifyOtp}
                className="px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors cursor-pointer"
              >
                Confirm Code
              </button>
              <button
                type="button"
                onClick={() => setShowOtpDemo(false)}
                className="px-3 py-1.5 text-xs text-zinc-500 hover:text-zinc-700 cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100 focus:outline-zinc-900 dark:focus:outline-zinc-100"
                placeholder="e.g. Aarav Sharma"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Mobile Number (for Handover & Contact) *
              </label>
              <input
                type="tel"
                required
                value={formData.mobile}
                onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100 focus:outline-zinc-900 dark:focus:outline-zinc-100 font-mono"
                placeholder="+91 98765 43210"
              />
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Default contact number for your account.
              </p>
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
              College Email (.edu / .ac.in) *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={e => setFormData({ ...formData, email: e.target.value })}
              className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100 focus:outline-zinc-900 dark:focus:outline-zinc-100"
              placeholder="rollnumber@campus.ac.in"
            />
          </div>

          {/* Education Stream Option: Engineering vs PUC */}
          <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800">
            <label className="block text-xs font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
              Select Your Education Stream *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleEducationTypeChange('Engineering')}
                className={`py-2 px-3 text-xs font-medium rounded border transition-colors cursor-pointer text-center ${
                  formData.educationType === 'Engineering'
                    ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 font-semibold'
                    : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100'
                }`}
              >
                Engineering Student
              </button>

              <button
                type="button"
                onClick={() => handleEducationTypeChange('PUC')}
                className={`py-2 px-3 text-xs font-medium rounded border transition-colors cursor-pointer text-center ${
                  formData.educationType === 'PUC'
                    ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 font-semibold'
                    : 'border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100'
                }`}
              >
                PUC Student (Pre-University)
              </button>
            </div>
          </div>

          {/* Dynamic Year of Study based on Education Stream */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Year of Study *
              </label>
              {formData.educationType === 'PUC' ? (
                <select
                  value={formData.yearOfStudy}
                  onChange={e => setFormData({ ...formData, yearOfStudy: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100 focus:outline-zinc-900 dark:focus:outline-zinc-100"
                >
                  <option value="1st Year (PUC I)">1st Year (PUC I / 11th)</option>
                  <option value="2nd Year (PUC II)">2nd Year (PUC II / 12th)</option>
                </select>
              ) : (
                <select
                  value={formData.yearOfStudy}
                  onChange={e => setFormData({ ...formData, yearOfStudy: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100 focus:outline-zinc-900 dark:focus:outline-zinc-100"
                >
                  <option value="1st Year">1st Year (Freshman)</option>
                  <option value="2nd Year">2nd Year (Sophomore)</option>
                  <option value="3rd Year">3rd Year (Junior)</option>
                  <option value="4th Year">4th Year (Senior)</option>
                  <option value="Postgraduate">Postgraduate / Research Scholar</option>
                </select>
              )}
            </div>

            {/* Department (Engineering) or Stream (PUC) */}
            <div>
              <label className="block text-xs font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                {formData.educationType === 'PUC' ? 'PUC Stream / Combination *' : 'Engineering Department *'}
              </label>
              {formData.educationType === 'PUC' ? (
                <select
                  value={formData.major}
                  onChange={e => setFormData({ ...formData, major: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100"
                >
                  {PUC_STREAMS.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              ) : (
                <select
                  value={formData.major}
                  onChange={e => setFormData({ ...formData, major: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded text-zinc-900 dark:text-zinc-100"
                >
                  {COMMON_ENGINEERING_MAJORS.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-2">
            <div>
              {onLogout && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onLogout();
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 rounded transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <span>🚪</span>
                  <span>Log Out of Account</span>
                </button>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-xs font-semibold text-white bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 rounded transition-colors cursor-pointer"
              >
                Save Profile
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
