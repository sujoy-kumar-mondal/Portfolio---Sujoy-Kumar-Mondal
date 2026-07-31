'use client';
import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/Sidebar';
import ImageUploader from '@/components/admin/ImageUploader';

interface ProfileData {
  name: string;
  intro: string;
  about: string;
  photoUrl: string;
  cvUrl: string;
  cursorUrl: string;
  skills: string[];
}

export default function AdminSettingsPage() {
  const [cursorUrl, setCursorUrl] = useState('');
  const [fullProfile, setFullProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingCursor, setSavingCursor] = useState(false);
  const [cursorSaved, setCursorSaved] = useState(false);

  // Admin Email state & OTP flow
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [emailOtpSent, setEmailOtpSent] = useState(false);
  const [emailOtpCode, setEmailOtpCode] = useState('');
  const [emailLoading, setEmailLoading] = useState(false);
  const [emailMsg, setEmailMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Password change state
  const [pwMode, setPwMode] = useState<'direct' | 'otp'>('direct');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [pwLoading, setPwLoading] = useState(false);
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // OTP state for password reset inside Settings
  const [otpEmail, setOtpEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpNewPassword, setOtpNewPassword] = useState('');

  useEffect(() => {
    fetch('/api/admin/profile').then(r => r.json()).then(data => {
      if (data) {
        setFullProfile(data);
        setCursorUrl(data.cursorUrl || '');
      }
      setLoading(false);
    });
  }, []);

  const handleSaveCursor = async (url: string) => {
    setCursorUrl(url);
    if (!fullProfile) return;
    setSavingCursor(true);
    const updated = { ...fullProfile, cursorUrl: url };
    const res = await fetch('/api/admin/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updated),
    });
    setSavingCursor(false);
    if (res.ok) {
      setFullProfile(updated);
      setCursorSaved(true);
      setTimeout(() => setCursorSaved(false), 3000);
    }
  };

  const handleRequestEmailOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail) return;
    setEmailLoading(true);
    setEmailMsg(null);
    try {
      const res = await fetch('/api/admin/change-email/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail: newAdminEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      setEmailOtpSent(true);
      setEmailMsg({ type: 'success', text: `OTP sent to ${newAdminEmail}. Please check your inbox.` });
    } catch (err: unknown) {
      setEmailMsg({ type: 'error', text: err instanceof Error ? err.message : 'Error sending OTP' });
    } finally {
      setEmailLoading(false);
    }
  };

  const handleVerifyUpdateEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAdminEmail || !emailOtpCode) return;
    setEmailLoading(true);
    setEmailMsg(null);
    try {
      const res = await fetch('/api/admin/change-email/verify-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newEmail: newAdminEmail, otp: emailOtpCode }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to verify OTP');
      setEmailMsg({ type: 'success', text: 'Admin email updated successfully!' });
      setEmailOtpSent(false);
      setEmailOtpCode('');
    } catch (err: unknown) {
      setEmailMsg({ type: 'error', text: err instanceof Error ? err.message : 'Error updating email' });
    } finally {
      setEmailLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPwMsg({ type: 'error', text: 'New passwords do not match' });
      return;
    }
    setPwLoading(true);
    setPwMsg(null);
    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to change password');
      setPwMsg({ type: 'success', text: 'Password updated successfully!' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      setPwMsg({ type: 'error', text: err instanceof Error ? err.message : 'Error changing password' });
    } finally {
      setPwLoading(false);
    }
  };

  const handleSendProfileOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwLoading(true);
    setPwMsg(null);
    try {
      const targetEmail = otpEmail || newAdminEmail;
      const res = await fetch('/api/admin/forgot-password/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      setOtpSent(true);
      setOtpEmail(targetEmail);
      setPwMsg({ type: 'success', text: 'OTP sent to your email successfully!' });
    } catch (err: unknown) {
      setPwMsg({ type: 'error', text: err instanceof Error ? err.message : 'Error sending OTP' });
    } finally {
      setPwLoading(false);
    }
  };

  const handleResetProfileOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwLoading(true);
    setPwMsg(null);
    try {
      const res = await fetch('/api/admin/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: otpEmail, otp: otpCode, newPassword: otpNewPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      setPwMsg({ type: 'success', text: 'Password reset successfully via OTP!' });
      setOtpCode('');
      setOtpNewPassword('');
      setOtpSent(false);
      setPwMode('direct');
    } catch (err: unknown) {
      setPwMsg({ type: 'error', text: err instanceof Error ? err.message : 'Error resetting password' });
    } finally {
      setPwLoading(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#0a0a0a]">
      <AdminSidebar />
      <main className="flex-1 p-8 flex items-center justify-center"><div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" /></main>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#0a0a0a] text-white">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Sticky Header */}
          <div className="sticky top-0 z-30 bg-[#0a0a0a] py-4 border-b border-white/10 flex items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">Settings</h1>
              <p className="text-gray-500 text-xs sm:text-sm">Manage admin email, security, and site cursor icon</p>
            </div>
            {cursorSaved && (
              <span className="text-xs text-emerald-400 font-semibold px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                ✓ Cursor Icon Saved!
              </span>
            )}
          </div>

          {/* Admin Email Section (Requires OTP Verification) */}
          <section className="bg-[#111] border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Change Admin Email Address</h2>
            {emailMsg && (
              <div className={`p-3 rounded-xl text-sm border ${emailMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                {emailMsg.text}
              </div>
            )}

            {!emailOtpSent ? (
              <form onSubmit={handleRequestEmailOTP} className="space-y-4">
                <p className="text-xs text-gray-400">
                  Changing your admin email address requires verification via a 6-digit OTP sent to your new email.
                </p>
                <div>
                  <label className="text-sm text-gray-300 block mb-1.5">New Admin Email Address</label>
                  <input
                    type="email"
                    value={newAdminEmail}
                    onChange={e => setNewAdminEmail(e.target.value)}
                    required
                    placeholder="newadmin@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={emailLoading || !newAdminEmail}
                  className="px-5 py-2 bg-gradient-to-r from-pink-500 to-orange-500 rounded-xl text-sm font-semibold disabled:opacity-50 transition-transform text-white"
                >
                  {emailLoading ? 'Sending OTP...' : 'Send Verification OTP to New Email'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyUpdateEmail} className="space-y-4">
                <p className="text-xs text-gray-400">
                  Enter the 6-digit OTP sent to <strong className="text-white">{newAdminEmail}</strong> to complete updating your admin email.
                </p>
                <div>
                  <label className="text-sm text-gray-300 block mb-1.5">6-Digit OTP</label>
                  <input
                    type="text"
                    value={emailOtpCode}
                    onChange={e => setEmailOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    maxLength={6}
                    placeholder="000000"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-2xl text-center font-bold tracking-[12px] text-white focus:outline-none focus:border-pink-500/50 transition-colors"
                  />
                </div>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setEmailOtpSent(false)}
                    className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm text-white"
                  >
                    Change Email Address
                  </button>
                  <button
                    type="submit"
                    disabled={emailLoading || emailOtpCode.length !== 6}
                    className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-orange-500 rounded-xl text-sm font-semibold disabled:opacity-50 transition-transform text-white"
                  >
                    {emailLoading ? 'Verifying...' : 'Verify OTP & Update Email'}
                  </button>
                </div>
              </form>
            )}
          </section>

          {/* Password & Security Section */}
          <section className="bg-[#111] border border-white/10 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Security & Password</h2>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => { setPwMode('direct'); setPwMsg(null); }}
                  className={`text-xs px-3 py-1 rounded-lg border transition-colors ${pwMode === 'direct' ? 'bg-white/20 border-white/30 text-white' : 'border-white/10 text-gray-400'}`}
                >
                  Change Password
                </button>
                <button
                  type="button"
                  onClick={() => { setPwMode('otp'); setPwMsg(null); }}
                  className={`text-xs px-3 py-1 rounded-lg border transition-colors ${pwMode === 'otp' ? 'bg-white/20 border-white/30 text-white' : 'border-white/10 text-gray-400'}`}
                >
                  Reset via Email OTP
                </button>
              </div>
            </div>

            {pwMsg && (
              <div className={`p-3 rounded-xl text-sm border ${pwMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                {pwMsg.text}
              </div>
            )}

            {pwMode === 'direct' ? (
              <form onSubmit={handleChangePassword} className="space-y-4">
                <div>
                  <label className="text-sm text-gray-300 block mb-1.5">Current Password</label>
                  <input
                    type="password"
                    value={currentPassword}
                    onChange={e => setCurrentPassword(e.target.value)}
                    required
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300 block mb-1.5">New Password</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300 block mb-1.5">Confirm New Password</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors"
                  />
                </div>
                <button
                  type="submit"
                  disabled={pwLoading}
                  className="px-5 py-2.5 bg-white/10 hover:bg-white/20 border border-white/10 rounded-xl text-sm font-semibold disabled:opacity-50 transition-colors text-white"
                >
                  {pwLoading ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            ) : (
              !otpSent ? (
                <form onSubmit={handleSendProfileOTP} className="space-y-4">
                  <p className="text-xs text-gray-400">
                    Forgot your current password? Request a 6-digit OTP to your admin email address to set a new password.
                  </p>
                  <div>
                    <label className="text-sm text-gray-300 block mb-1.5">Admin Email</label>
                    <input
                      type="email"
                      value={otpEmail || newAdminEmail}
                      onChange={e => setOtpEmail(e.target.value)}
                      required
                      placeholder="Enter admin email for OTP"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={pwLoading}
                    className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-orange-500 rounded-xl text-sm font-semibold disabled:opacity-50 transition-transform text-white"
                  >
                    {pwLoading ? 'Sending OTP...' : 'Send OTP to Email'}
                  </button>
                </form>
              ) : (
                <form onSubmit={handleResetProfileOTP} className="space-y-4">
                  <p className="text-xs text-gray-400">
                    Enter the 6-digit OTP sent to <strong className="text-white">{otpEmail}</strong> and your new password.
                  </p>
                  <div>
                    <label className="text-sm text-gray-300 block mb-1.5">6-Digit OTP</label>
                    <input
                      type="text"
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      maxLength={6}
                      placeholder="000000"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-2xl text-center font-bold tracking-[12px] text-white focus:outline-none focus:border-pink-500/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-300 block mb-1.5">New Password</label>
                    <input
                      type="password"
                      value={otpNewPassword}
                      onChange={e => setOtpNewPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setOtpSent(false)}
                      className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm text-white"
                    >
                      Resend OTP
                    </button>
                    <button
                      type="submit"
                      disabled={pwLoading || otpCode.length !== 6 || otpNewPassword.length < 6}
                      className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-orange-500 rounded-xl text-sm font-semibold disabled:opacity-50 transition-transform text-white"
                    >
                      {pwLoading ? 'Resetting...' : 'Reset Password'}
                    </button>
                  </div>
                </form>
              )
            )}
          </section>

          {/* Custom Cursor Icon Section */}
          <section className="bg-[#111] border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Site Appearance & Custom Cursor</h2>
            <ImageUploader
              label="Custom Cursor Icon (PNG/SVG, 32×32)"
              currentUrl={cursorUrl}
              folder="cursor"
              onUpload={handleSaveCursor}
              accept="image/*"
            />
            {savingCursor && <p className="text-xs text-pink-400">Saving custom cursor icon...</p>}
          </section>
        </div>
      </main>
    </div>
  );
}
