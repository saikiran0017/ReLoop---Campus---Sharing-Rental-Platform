import React, { useState } from 'react';
import { UserProfile, EducationType } from '../types';

interface AuthScreenProps {
  existingUser: UserProfile | null;
  onLoginSuccess: (user: UserProfile) => void;
  onClearAccount?: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
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

export const AuthScreen: React.FC<AuthScreenProps> = ({
  existingUser,
  onLoginSuccess,
  onClearAccount,
  darkMode,
  onToggleDarkMode,
  onShowToast,
}) => {
  // Mode: 'unlock' (for returning users) or 'register' (for new users)
  const [authMode, setAuthMode] = useState<'unlock' | 'register'>(
    existingUser ? 'unlock' : 'register'
  );

  // Registration step: 1 (details + email otp) -> 2 (pin + biometrics setup)
  const [registerStep, setRegisterStep] = useState<1 | 2>(1);

  // Registration Fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [mobile, setMobile] = useState('');
  const [educationType, setEducationType] = useState<EducationType>('Engineering');
  const [yearOfStudy, setYearOfStudy] = useState('2nd Year');
  const [major, setMajor] = useState(COMMON_ENGINEERING_MAJORS[0]);

  // Email verification state
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const [demoCodeNotice, setDemoCodeNotice] = useState<string | null>(null);

  // Security Credentials Creation (Step 2)
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [enableBiometric, setEnableBiometric] = useState(true);
  const [biometricTested, setBiometricTested] = useState(false);

  // Unlock State (for returning user)
  const [enteredPin, setEnteredPin] = useState('');
  const [isBiometricScanning, setIsBiometricScanning] = useState(false);

  // Forgot PIN reset state
  const [showForgotPin, setShowForgotPin] = useState(false);
  const [resetOtp, setResetOtp] = useState('');

  // 1. Education Type Change
  const handleEducationTypeChange = (type: EducationType) => {
    setEducationType(type);
    if (type === 'PUC') {
      setYearOfStudy('1st Year (PUC I)');
      setMajor(PUC_STREAMS[0]);
    } else {
      setYearOfStudy('2nd Year');
      setMajor(COMMON_ENGINEERING_MAJORS[0]);
    }
  };

  // 2. Email Verification OTP
  const handleSendOtp = () => {
    if (!email.trim() || !email.includes('@')) {
      onShowToast('Please enter a valid college email address.');
      return;
    }
    setOtpSent(true);
    setDemoCodeNotice('8241');
    onShowToast(`Demo verification code "8241" sent to ${email}`);
  };

  const handleVerifyOtp = () => {
    if (otpCode.trim() === '8241') {
      setIsEmailVerified(true);
      setDemoCodeNotice(null);
      onShowToast('🎉 College email verified! Proceed to setup your Security PIN.');
    } else {
      onShowToast('Invalid code. For this demo, use code: 8241');
    }
  };

  // 3. Step 1 Submit -> Proceed to Step 2
  const handleProceedToSecuritySetup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      onShowToast('Please enter your full name.');
      return;
    }
    if (!mobile.trim()) {
      onShowToast('Please enter your mobile contact number.');
      return;
    }
    if (!email.trim()) {
      onShowToast('Please enter your college email.');
      return;
    }
    if (!isEmailVerified) {
      onShowToast('Mandatory: Please verify your college email with the OTP code first.');
      return;
    }
    setRegisterStep(2);
  };

  // 4. Test Biometric sensor
  const handleTestBiometric = () => {
    setIsBiometricScanning(true);
    setTimeout(() => {
      setIsBiometricScanning(false);
      setBiometricTested(true);
      onShowToast('✅ Biometric sensor verified (Fingerprint / Touch ID recorded).');
    }, 900);
  };

  // 5. Step 2 Submit -> Finish Registration
  const handleFinishRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin.length < 4) {
      onShowToast('Please enter a 4-digit Security PIN.');
      return;
    }
    if (newPin !== confirmPin) {
      onShowToast('Security PINs do not match. Please re-enter.');
      return;
    }

    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      mobile: mobile.trim(),
      educationType,
      yearOfStudy,
      major,
      emailVerified: true,
      phoneVerified: true,
      trustScore: 60,
      loansCompleted: 0,
      onTimeRate: 100,
      securityPin: newPin,
      biometricEnabled: enableBiometric,
    };

    onLoginSuccess(newUser);
    onShowToast(`🎉 Account created & secured! Welcome to ReLoop, ${newUser.name.split(' ')[0]}!`);
  };

  // 6. Unlock via PIN (Returning User)
  const handleUnlockWithPin = (e: React.FormEvent) => {
    e.preventDefault();
    const correctPin = existingUser?.securityPin || '1234';
    if (enteredPin === correctPin) {
      if (existingUser) {
        onLoginSuccess(existingUser);
      }
      onShowToast('🔓 Security PIN verified. Welcome back!');
    } else {
      onShowToast('❌ Incorrect PIN. Please try again or use Biometrics (Default Demo PIN: 1234)');
    }
  };

  // 7. Unlock via Biometric
  const handleBiometricUnlock = () => {
    setIsBiometricScanning(true);
    setTimeout(() => {
      setIsBiometricScanning(false);
      if (existingUser) {
        onLoginSuccess(existingUser);
      }
      onShowToast('👆 Biometric recognized! ReLoop unlocked.');
    }, 800);
  };

  // 8. Quick Demo Student Fill & Login
  const handleQuickDemo = () => {
    const demoUser: UserProfile = {
      id: 'user_current',
      name: 'Aarav Sharma',
      email: 'aarav.s@campus.ac.in',
      mobile: '+91 98765 43210',
      educationType: 'Engineering',
      yearOfStudy: '2nd Year',
      major: 'Computer Science & Engineering',
      emailVerified: true,
      phoneVerified: true,
      trustScore: 60,
      loansCompleted: 0,
      onTimeRate: 100,
      securityPin: '1234',
      biometricEnabled: true,
    };

    onLoginSuccess(demoUser);
    onShowToast('⚡ Unlocked with verified student profile (PIN: 1234 / Biometric enabled).');
  };

  // 9. Reset PIN with OTP
  const handleResetPinWithOtp = () => {
    if (resetOtp.trim() === '8241') {
      if (existingUser) {
        const updated = { ...existingUser, securityPin: '1234' };
        onLoginSuccess(updated);
      }
      setShowForgotPin(false);
      onShowToast('PIN reset to default: 1234 and logged in!');
    } else {
      onShowToast('Use demo reset OTP code: 8241');
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 transition-colors">
      {/* Top Bar with Brand & Theme Toggle */}
      <header className="max-w-4xl w-full mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            ReLoop
          </span>
          <span className="text-xs text-zinc-400 dark:text-zinc-600 hidden sm:inline">·</span>
          <span className="text-xs text-zinc-500 dark:text-zinc-400 hidden sm:inline">
            Campus Peer Sharing & Security Portal
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleDarkMode}
            title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-1.5 text-xs text-zinc-600 dark:text-zinc-300 rounded border border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            {darkMode ? '☀️ Light' : '🌙 Dark'}
          </button>
        </div>
      </header>

      {/* Main Authentication Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6">
        
        {/* ========================================================= */}
        {/* VIEW 1: SECURITY PIN & BIOMETRIC UNLOCK (RETURNING USER) */}
        {/* ========================================================= */}
        {authMode === 'unlock' && existingUser && (
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg overflow-hidden">
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 text-center">
              <div className="w-16 h-16 rounded-full bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-300 dark:border-zinc-700 flex items-center justify-center mx-auto mb-3 text-2xl">
                🔒
              </div>
              <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">
                Security Verification
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                Enter your 4-digit PIN or use Biometrics to access your campus account.
              </p>

              {/* Student identity chip */}
              <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-zinc-100 dark:bg-zinc-800 rounded-full text-xs text-zinc-800 dark:text-zinc-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
                <span className="font-semibold">{existingUser.name}</span>
                <span className="text-zinc-400">·</span>
                <span className="text-zinc-500 dark:text-zinc-400">{existingUser.yearOfStudy}</span>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* PIN Form */}
              <form onSubmit={handleUnlockWithPin} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 text-center mb-2">
                    Enter 4-Digit Security PIN
                  </label>
                  <div className="flex justify-center">
                    <input
                      type="password"
                      maxLength={6}
                      autoFocus
                      value={enteredPin}
                      onChange={e => setEnteredPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="••••"
                      className="w-44 px-4 py-2.5 text-2xl font-mono tracking-[0.4em] text-center bg-zinc-50 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-zinc-900 dark:focus:outline-zinc-100"
                    />
                  </div>
                  <p className="text-[11px] text-zinc-400 text-center mt-1">
                    Default demo PIN: <strong className="font-mono text-zinc-600 dark:text-zinc-300">1234</strong>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={enteredPin.length < 4}
                  className={`w-full py-2.5 px-4 text-xs font-bold rounded-lg transition-colors text-center ${
                    enteredPin.length >= 4
                      ? 'bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 cursor-pointer shadow-xs'
                      : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
                  }`}
                >
                  Unlock with PIN →
                </button>
              </form>

              {/* Biometric Section */}
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 text-center space-y-2">
                <span className="text-[11px] text-zinc-400 uppercase tracking-wider font-semibold">
                  Or authenticate with Biometrics
                </span>

                <button
                  type="button"
                  onClick={handleBiometricUnlock}
                  disabled={isBiometricScanning}
                  className="w-full py-2.5 px-4 flex items-center justify-center gap-2 bg-emerald-50 hover:bg-emerald-100 dark:bg-emerald-950/40 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                >
                  {isBiometricScanning ? (
                    <span className="flex items-center gap-2 animate-pulse">
                      <span>🔄</span>
                      <span>Scanning Touch ID / Face ID...</span>
                    </span>
                  ) : (
                    <>
                      <span className="text-base">👆</span>
                      <span>Use Biometric (Fingerprint / Face ID)</span>
                    </>
                  )}
                </button>
              </div>

              {/* Forgot PIN & Switch Account */}
              <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 flex flex-col gap-2 text-center text-xs">
                {!showForgotPin ? (
                  <button
                    type="button"
                    onClick={() => {
                      setShowForgotPin(true);
                      onShowToast('Demo reset OTP "8241" generated.');
                    }}
                    className="text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 underline cursor-pointer text-[11px]"
                  >
                    Forgot Security PIN?
                  </button>
                ) : (
                  <div className="p-3 bg-blue-50 dark:bg-blue-950/40 rounded border border-blue-200 dark:border-blue-900 text-left space-y-2">
                    <div className="text-[11px] text-blue-900 dark:text-blue-200 font-medium">
                      Reset PIN with College Email OTP (Code: 8241)
                    </div>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="8241"
                        value={resetOtp}
                        onChange={e => setResetOtp(e.target.value)}
                        className="w-24 px-2 py-1 text-xs font-mono text-center bg-white dark:bg-zinc-900 border rounded"
                      />
                      <button
                        type="button"
                        onClick={handleResetPinWithOtp}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-xs font-medium cursor-pointer"
                      >
                        Confirm Reset
                      </button>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1 text-[11px] text-zinc-500">
                  <button
                    type="button"
                    onClick={() => {
                      if (onClearAccount) onClearAccount();
                      setAuthMode('register');
                      setRegisterStep(1);
                    }}
                    className="text-red-600 dark:text-red-400 hover:underline cursor-pointer font-medium flex items-center gap-1"
                  >
                    <span>🚪</span>
                    <span>Log Out / Switch Account</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleQuickDemo}
                    className="text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer font-medium"
                  >
                    ⚡ Instant Demo Unlock
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* VIEW 2: NEW STUDENT REGISTRATION & CREDENTIALS SETUP      */}
        {/* ========================================================= */}
        {authMode === 'register' && (
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xs overflow-hidden">
            {/* Header */}
            <div className="p-6 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                  Step {registerStep} of 2: {registerStep === 1 ? 'Academic Info' : 'Security PIN & Biometrics'}
                </span>
                {existingUser && (
                  <button
                    type="button"
                    onClick={() => setAuthMode('unlock')}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                  >
                    ← Back to PIN Unlock
                  </button>
                )}
              </div>
              <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 tracking-tight mt-2">
                {registerStep === 1 ? 'Student Registration & Email Verification' : 'Create Security PIN & Biometrics'}
              </h1>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                {registerStep === 1
                  ? 'Provide your academic details and authenticate your college email address.'
                  : 'Set up your master Security PIN and biometric credentials for opening the app.'}
              </p>
            </div>

            {/* STEP 1: BASIC DETAILS & EMAIL OTP */}
            {registerStep === 1 && (
              <form onSubmit={handleProceedToSecuritySetup} className="p-6 space-y-4">
                {/* Name & Mobile */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={e => setName(e.target.value)}
                      placeholder="e.g. Aarav Sharma"
                      className="w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-zinc-900 dark:focus:outline-zinc-100"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Mobile Number *
                    </label>
                    <input
                      type="tel"
                      required
                      value={mobile}
                      onChange={e => setMobile(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 font-mono focus:outline-zinc-900 dark:focus:outline-zinc-100"
                    />
                    <span className="text-[10px] text-zinc-500 dark:text-zinc-400 mt-0.5 block">
                      Used for optional item contact & handover.
                    </span>
                  </div>
                </div>

                {/* Education Stream Option */}
                <div className="pt-1">
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1.5">
                    Education Stream *
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => handleEducationTypeChange('Engineering')}
                      className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors cursor-pointer text-center ${
                        educationType === 'Engineering'
                          ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 font-semibold'
                          : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100'
                      }`}
                    >
                      Engineering Student
                    </button>

                    <button
                      type="button"
                      onClick={() => handleEducationTypeChange('PUC')}
                      className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors cursor-pointer text-center ${
                        educationType === 'PUC'
                          ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900 font-semibold'
                          : 'border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100'
                      }`}
                    >
                      PUC Student (Pre-University)
                    </button>
                  </div>
                </div>

                {/* Year of Study & Major/Stream */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Year of Study *
                    </label>
                    {educationType === 'PUC' ? (
                      <select
                        value={yearOfStudy}
                        onChange={e => setYearOfStudy(e.target.value)}
                        className="w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-zinc-900 dark:focus:outline-zinc-100"
                      >
                        <option value="1st Year (PUC I)">1st Year (PUC I / 11th)</option>
                        <option value="2nd Year (PUC II)">2nd Year (PUC II / 12th)</option>
                      </select>
                    ) : (
                      <select
                        value={yearOfStudy}
                        onChange={e => setYearOfStudy(e.target.value)}
                        className="w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-zinc-900 dark:focus:outline-zinc-100"
                      >
                        <option value="1st Year">1st Year (Freshman)</option>
                        <option value="2nd Year">2nd Year (Sophomore)</option>
                        <option value="3rd Year">3rd Year (Junior)</option>
                        <option value="4th Year">4th Year (Senior)</option>
                        <option value="Postgraduate">Postgraduate / Research Scholar</option>
                      </select>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      {educationType === 'PUC' ? 'PUC Stream / Combination *' : 'Engineering Department *'}
                    </label>
                    {educationType === 'PUC' ? (
                      <select
                        value={major}
                        onChange={e => setMajor(e.target.value)}
                        className="w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-zinc-900 dark:focus:outline-zinc-100"
                      >
                        {PUC_STREAMS.map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    ) : (
                      <select
                        value={major}
                        onChange={e => setMajor(e.target.value)}
                        className="w-full px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-zinc-900 dark:focus:outline-zinc-100"
                      >
                        {COMMON_ENGINEERING_MAJORS.map(m => (
                          <option key={m} value={m}>{m}</option>
                        ))}
                      </select>
                    )}
                  </div>
                </div>

                {/* Mandatory College Email Verification */}
                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800 space-y-2.5">
                  <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                    Institutional College Email & Verification *
                  </label>

                  <div className="flex gap-2">
                    <input
                      type="email"
                      required
                      disabled={isEmailVerified}
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="yourname@campus.ac.in or .edu"
                      className={`flex-1 px-3.5 py-2 text-sm bg-zinc-50 dark:bg-zinc-800 border rounded-lg ${
                        isEmailVerified
                          ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-900 dark:text-emerald-200'
                          : 'border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100'
                      }`}
                    />
                    {!isEmailVerified && (
                      <button
                        type="button"
                        onClick={handleSendOtp}
                        className="px-3.5 py-2 text-xs font-medium bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 text-white rounded-lg transition-colors whitespace-nowrap cursor-pointer"
                      >
                        {otpSent ? 'Resend Code' : 'Send Code'}
                      </button>
                    )}
                  </div>

                  {/* Demo Code Helper */}
                  {demoCodeNotice && !isEmailVerified && (
                    <div className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900 rounded-lg text-xs space-y-2">
                      <div className="flex items-center justify-between text-blue-900 dark:text-blue-200 font-semibold">
                        <span>Demo Verification Code Sent</span>
                        <span className="font-mono bg-blue-100 dark:bg-blue-900 px-2 py-0.5 rounded tracking-wider">
                          {demoCodeNotice}
                        </span>
                      </div>
                      <p className="text-[11px] text-blue-700 dark:text-blue-300">
                        Enter code <strong className="font-mono">{demoCodeNotice}</strong> below to verify.
                      </p>
                      <div className="flex gap-2 pt-1">
                        <input
                          type="text"
                          maxLength={4}
                          value={otpCode}
                          onChange={e => setOtpCode(e.target.value)}
                          placeholder="8241"
                          className="w-28 px-3 py-1.5 text-center font-mono text-sm tracking-widest bg-white dark:bg-zinc-900 border border-blue-300 dark:border-blue-700 rounded-md text-zinc-900 dark:text-zinc-100"
                        />
                        <button
                          type="button"
                          onClick={handleVerifyOtp}
                          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors cursor-pointer"
                        >
                          Verify Now
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Verified Badge */}
                  {isEmailVerified && (
                    <div className="p-2.5 bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg flex items-center justify-between text-xs text-emerald-800 dark:text-emerald-300">
                      <span className="flex items-center gap-1.5 font-medium">
                        <span>✓</span>
                        <span>College email verified successfully!</span>
                      </span>
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">
                        +20 Trust Points
                      </span>
                    </div>
                  )}
                </div>

                {/* Continue to Step 2 Action */}
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 space-y-2.5">
                  <button
                    type="submit"
                    disabled={!isEmailVerified}
                    className={`w-full py-2.5 px-4 text-sm font-semibold rounded-lg transition-colors text-center ${
                      isEmailVerified
                        ? 'bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 cursor-pointer shadow-xs'
                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
                    }`}
                  >
                    {isEmailVerified ? 'Next: Setup PIN & Biometric →' : 'Verify College Email to Continue'}
                  </button>

                  <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 pt-1">
                    <span>Quick access?</span>
                    <button
                      type="button"
                      onClick={handleQuickDemo}
                      className="font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                    >
                      ⚡ Quick Demo Sign-In (Aarav Sharma)
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* STEP 2: CREATE SECURITY PIN & BIOMETRICS */}
            {registerStep === 2 && (
              <form onSubmit={handleFinishRegistration} className="p-6 space-y-5">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-800/50 rounded-lg border border-zinc-200 dark:border-zinc-700 text-xs">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-100">🔒 Security Shield:</span>
                  <p className="text-zinc-600 dark:text-zinc-400 mt-0.5">
                    This PIN and biometric authentication will be required whenever you open ReLoop to protect your rentals, deposits, and messages.
                  </p>
                </div>

                {/* Create 4-Digit PIN */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Set 4-Digit Security PIN *
                    </label>
                    <input
                      type="password"
                      required
                      maxLength={6}
                      value={newPin}
                      onChange={e => setNewPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 1234"
                      className="w-full px-3.5 py-2 text-base font-mono tracking-widest bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-zinc-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                      Confirm Security PIN *
                    </label>
                    <input
                      type="password"
                      required
                      maxLength={6}
                      value={confirmPin}
                      onChange={e => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                      placeholder="e.g. 1234"
                      className="w-full px-3.5 py-2 text-base font-mono tracking-widest bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg text-zinc-900 dark:text-zinc-100 focus:outline-zinc-900"
                    />
                  </div>
                </div>

                {/* Biometric Toggle & Test */}
                <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 block">
                        Enable Biometric Unlock
                      </label>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        Use Fingerprint / Face ID for 1-tap instant unlock
                      </span>
                    </div>
                    <input
                      type="checkbox"
                      checked={enableBiometric}
                      onChange={e => setEnableBiometric(e.target.checked)}
                      className="w-4 h-4 accent-zinc-900 dark:accent-zinc-100 cursor-pointer"
                    />
                  </div>

                  {enableBiometric && (
                    <div className="p-3 bg-zinc-50 dark:bg-zinc-800/40 rounded-lg border border-zinc-200 dark:border-zinc-700 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">👆</span>
                        <span className="text-zinc-700 dark:text-zinc-300">
                          {biometricTested ? 'Biometric sensor linked successfully!' : 'Test biometric on this device:'}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={handleTestBiometric}
                        className="px-2.5 py-1 text-xs font-medium bg-zinc-200 hover:bg-zinc-300 dark:bg-zinc-700 dark:hover:bg-zinc-600 rounded transition-colors cursor-pointer"
                      >
                        {isBiometricScanning ? 'Scanning...' : biometricTested ? '✓ Tested' : 'Test Scan'}
                      </button>
                    </div>
                  )}
                </div>

                {/* Final Submit Actions */}
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setRegisterStep(1)}
                    className="px-4 py-2.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-700 cursor-pointer"
                  >
                    ← Back
                  </button>

                  <button
                    type="submit"
                    disabled={newPin.length < 4 || newPin !== confirmPin}
                    className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-lg transition-colors text-center ${
                      newPin.length >= 4 && newPin === confirmPin
                        ? 'bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200 cursor-pointer shadow-xs'
                        : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 cursor-not-allowed'
                    }`}
                  >
                    Save Security Credentials & Open App →
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto px-4 py-4 text-center text-xs text-zinc-400 dark:text-zinc-500">
        ReLoop Campus Platform · Secured with PIN & Biometric Authentication
      </footer>
    </div>
  );
};
