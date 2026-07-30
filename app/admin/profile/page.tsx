'use client';
import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/Sidebar';
import ImageUploader from '@/components/admin/ImageUploader';

interface Profile {
  name: string;
  intro: string;
  about: string;
  photoUrl: string;
  cvUrl: string;
  cursorUrl: string;
  skills: string[];
}

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<Profile>({ name: '', intro: '', about: '', photoUrl: '', cvUrl: '', cursorUrl: '', skills: [] });
  const [skillInput, setSkillInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

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

  // OTP state for password reset inside Profile
  const [otpEmail, setOtpEmail] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpNewPassword, setOtpNewPassword] = useState('');

  useEffect(() => {
    fetch('/api/admin/profile').then(r => r.json()).then(data => {
      setProfile(data);
      setLoading(false);
    });
  }, []);

  const addSkill = () => {
    const s = skillInput.trim();
    if (s && !profile.skills.includes(s)) {
      setProfile(p => ({ ...p, skills: [...p.skills, s.startsWith('#') ? s : `#${s}`] }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setProfile(p => ({ ...p, skills: p.skills.filter(s => s !== skill) }));
  };

  const save = async () => {
    setSaving(true);
    const res = await fetch('/api/admin/profile', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(profile) });
    setSaving(false);
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
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
    <div className="flex bg-[#0a0a0a] min-h-screen">
      <AdminSidebar />
      <main className="flex-1 p-8 flex items-center justify-center"><div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" /></main>
    </div>
  );

  return (
    <div className="flex min-h-screen bg-[#0a0a0a] text-white">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Profile</h1>
              <p className="text-gray-500 text-sm">Update your personal information & security settings</p>
            </div>
            <button
              onClick={save}
              disabled={saving}
              className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-orange-500 rounded-xl text-sm font-semibold disabled:opacity-50 hover:scale-105 transition-transform text-white"
            >
              {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
            </button>
          </div>

          {/* Basic Info */}
          <section className="bg-[#111] border border-white/10 rounded-2xl p-6 space-y-5">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Basic Info</h2>
            <div>
              <label className="text-sm text-gray-300 block mb-1.5">Your Name</label>
              <input type="text" value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors" />
            </div>
            <div>
              <label className="text-sm text-gray-300 block mb-1.5">Intro Text (below your name)</label>
              <input type="text" value={profile.intro} onChange={e => setProfile(p => ({ ...p, intro: e.target.value }))}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors"
                placeholder="e.g. I am a Web Developer" />
            </div>
            <div>
              <label className="text-sm text-gray-300 block mb-1.5">About Me (bio paragraph)</label>
              <textarea value={profile.about} onChange={e => setProfile(p => ({ ...p, about: e.target.value }))} rows={5}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors resize-none"
                placeholder="Write your bio here..." />
            </div>
          </section>

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

          {/* Skills */}
          <section className="bg-[#111] border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Skills / Tags</h2>
            <div className="flex gap-2">
              <input type="text" value={skillInput} onChange={e => setSkillInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="python (# added automatically)"
                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors" />
              <button onClick={addSkill} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-colors">Add</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map(skill => (
                <span key={skill} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/20 text-xs text-gray-300">
                  {skill}
                  <button onClick={() => removeSkill(skill)} className="text-gray-600 hover:text-red-400 transition-colors">✕</button>
                </span>
              ))}
            </div>
          </section>

          {/* Uploads */}
          <section className="bg-[#111] border border-white/10 rounded-2xl p-6 space-y-6">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">File Uploads</h2>
            <ImageUploader label="Profile Photo" currentUrl={profile.photoUrl} folder="profile" onUpload={url => setProfile(p => ({ ...p, photoUrl: url }))} />
            <ImageUploader label="CV / Resume (PDF)" currentUrl={profile.cvUrl} folder="cv" resourceType="raw" onUpload={url => setProfile(p => ({ ...p, cvUrl: url }))} accept=".pdf" />
            <ImageUploader label="Custom Cursor Icon (PNG/SVG, 32×32)" currentUrl={profile.cursorUrl} folder="cursor" onUpload={url => setProfile(p => ({ ...p, cursorUrl: url }))} accept="image/*" />
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

          <button
            onClick={save}
            disabled={saving}
            className="w-full py-3 bg-gradient-to-r from-pink-500 to-orange-500 rounded-xl text-sm font-semibold disabled:opacity-50 hover:scale-[1.01] transition-transform text-white"
          >
            {saving ? 'Saving...' : saved ? '✓ Changes Saved!' : 'Save All Changes'}
          </button>
        </div>
      </main>
    </div>
  );
}
