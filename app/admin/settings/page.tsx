'use client';
import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/Sidebar';
import ImageUploader, { uploadFileToCloudinary } from '@/components/admin/ImageUploader';

interface ProfileData {
  name: string;
  intro: string;
  about: string;
  photoUrl: string;
  cvUrl: string;
  skills: string[];
}

interface MetadataData {
  title: string;
  description: string;
  keywords: string[];
  icons: {
    icon: string;
    shortcut: string;
    apple: string;
  };
  openGraph: {
    title: string;
    description: string;
    type: string;
  };
  logos?: {
    navbarLogo?: string;
    bannerLogo?: string;
  };
  cursorUrl?: string;
}

export default function AdminSettingsPage() {
  const [cursorUrl, setCursorUrl] = useState('');
  const [initialCursorUrl, setInitialCursorUrl] = useState('');
  const [pendingCursorFile, setPendingCursorFile] = useState<File | null>(null);
  const [fullProfile, setFullProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingCursor, setSavingCursor] = useState(false);
  const [cursorSaved, setCursorSaved] = useState(false);

  // Metadata & Logos state
  const [metaTitle, setMetaTitle] = useState('');
  const [metaDescription, setMetaDescription] = useState('');
  const [keywordsStr, setKeywordsStr] = useState('');

  const [faviconUrl, setFaviconUrl] = useState('');
  const [pendingFaviconFile, setPendingFaviconFile] = useState<File | null>(null);

  const [ogTitle, setOgTitle] = useState('');
  const [ogDescription, setOgDescription] = useState('');
  const [ogType, setOgType] = useState('website');

  const [navbarLogoUrl, setNavbarLogoUrl] = useState('');
  const [bannerLogoUrl, setBannerLogoUrl] = useState('');
  const [pendingNavbarLogoFile, setPendingNavbarLogoFile] = useState<File | null>(null);
  const [pendingBannerLogoFile, setPendingBannerLogoFile] = useState<File | null>(null);

  const [initialMetadata, setInitialMetadata] = useState<MetadataData | null>(null);
  const [savingMeta, setSavingMeta] = useState(false);
  const [metaSaved, setMetaSaved] = useState(false);
  const [metaMsg, setMetaMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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
    Promise.all([
      fetch('/api/admin/profile').then(r => r.json()),
      fetch('/api/admin/metadata').then(r => r.json()),
    ]).then(([profileData, metaData]) => {
      if (profileData) {
        setFullProfile(profileData);
      }
      if (metaData && !metaData.error) {
        populateMetadataState(metaData);
      }
      setLoading(false);
    }).catch(err => {
      console.error('Failed to load settings data:', err);
      setLoading(false);
    });
  }, []);

  const populateMetadataState = (meta: MetadataData) => {
    setInitialMetadata(meta);
    setMetaTitle(meta.title || '');
    setMetaDescription(meta.description || '');
    setKeywordsStr(Array.isArray(meta.keywords) ? meta.keywords.join(', ') : '');

    const currentFavicon = meta.icons?.icon || meta.icons?.shortcut || meta.icons?.apple || '';
    setFaviconUrl(currentFavicon);

    setOgTitle(meta.openGraph?.title || meta.title || '');
    setOgDescription(meta.openGraph?.description || meta.description || '');
    setOgType(meta.openGraph?.type || 'website');

    setNavbarLogoUrl(meta.logos?.navbarLogo || '');
    setBannerLogoUrl(meta.logos?.bannerLogo || '');

    setCursorUrl(meta.cursorUrl || '');
    setInitialCursorUrl(meta.cursorUrl || '');

    setPendingFaviconFile(null);
    setPendingNavbarLogoFile(null);
    setPendingBannerLogoFile(null);
    setPendingCursorFile(null);
  };

  const handleCancelMetadata = () => {
    if (initialMetadata) {
      populateMetadataState(initialMetadata);
      setMetaMsg(null);
    }
  };

  const handleSaveMetadata = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingMeta(true);
    setMetaMsg(null);

    try {
      let finalFavicon = faviconUrl;
      let finalNavbarLogo = navbarLogoUrl;
      let finalBannerLogo = bannerLogoUrl;

      // Upload pending files to Cloudinary storage
      if (pendingFaviconFile) {
        finalFavicon = await uploadFileToCloudinary(pendingFaviconFile, 'favicons', 'image');
      }

      if (pendingNavbarLogoFile) {
        finalNavbarLogo = await uploadFileToCloudinary(pendingNavbarLogoFile, 'logos', 'image');
      }
      if (pendingBannerLogoFile) {
        finalBannerLogo = await uploadFileToCloudinary(pendingBannerLogoFile, 'logos', 'image');
      }

      const keywordsArray = keywordsStr
        .split(',')
        .map(k => k.trim())
        .filter(Boolean);

      const payload = {
        title: metaTitle,
        description: metaDescription,
        keywords: keywordsArray,
        icons: {
          icon: finalFavicon,
          shortcut: finalFavicon,
          apple: finalFavicon,
        },
        openGraph: {
          title: ogTitle || metaTitle,
          description: ogDescription || metaDescription,
          type: ogType || 'website',
        },
        logos: {
          navbarLogo: finalNavbarLogo,
          bannerLogo: finalBannerLogo,
        },
        cursorUrl,
      };

      const res = await fetch('/api/admin/metadata', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const updated = await res.json();
      if (!res.ok) throw new Error(updated.error || 'Failed to save metadata');

      populateMetadataState(updated);
      setMetaSaved(true);
      setMetaMsg({ type: 'success', text: 'Website metadata & branding logos updated successfully!' });
      setTimeout(() => setMetaSaved(false), 4000);
    } catch (err: unknown) {
      console.error('Save metadata error:', err);
      setMetaMsg({ type: 'error', text: err instanceof Error ? err.message : 'Error saving metadata' });
    } finally {
      setSavingMeta(false);
    }
  };

  const handleCancelCursor = () => {
    setCursorUrl(initialCursorUrl);
    setPendingCursorFile(null);
  };

  const handleSaveCursor = async () => {
    setSavingCursor(true);
    try {
      let finalCursorUrl = cursorUrl;
      if (pendingCursorFile) {
        finalCursorUrl = await uploadFileToCloudinary(pendingCursorFile, 'cursor', 'image');
      }

      const currentMetaRes = await fetch('/api/admin/metadata');
      const currentMeta = await currentMetaRes.json();

      const updatedPayload = {
        ...currentMeta,
        cursorUrl: finalCursorUrl,
      };

      const res = await fetch('/api/admin/metadata', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPayload),
      });

      const data = await res.json();
      if (res.ok && !data.error) {
        populateMetadataState(data);
        setCursorSaved(true);
        setTimeout(() => setCursorSaved(false), 3000);
      }
    } catch (e) {
      console.error('Failed to save custom cursor:', e);
    } finally {
      setSavingCursor(false);
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
              <p className="text-gray-500 text-xs sm:text-sm">Manage website metadata, logos, email, security, and cursor</p>
            </div>
            {metaSaved && (
              <span className="text-xs text-emerald-400 font-semibold px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                ✓ Metadata Saved!
              </span>
            )}
          </div>

          {/* Website Metadata & SEO Section */}
          <form onSubmit={handleSaveMetadata} className="space-y-6">
            <section className="bg-[#111] border border-white/10 rounded-2xl p-6 space-y-5">
              <div className="border-b border-white/10 pb-3">
                <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Website Metadata & SEO</h2>
                <p className="text-xs text-gray-500 mt-1">Configure global search engine metadata, descriptions, keywords, and favicons.</p>
              </div>

              {metaMsg && (
                <div className={`p-3 rounded-xl text-sm border ${metaMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
                  {metaMsg.text}
                </div>
              )}

              {/* General SEO Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-gray-300 block mb-1.5 font-medium">Website Title</label>
                  <input
                    type="text"
                    value={metaTitle}
                    onChange={e => setMetaTitle(e.target.value)}
                    required
                    placeholder="Website Title - Portfolio"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-300 block mb-1.5 font-medium">Meta Description</label>
                  <textarea
                    value={metaDescription}
                    onChange={e => setMetaDescription(e.target.value)}
                    required
                    rows={3}
                    placeholder="Enter website meta description..."
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="text-sm text-gray-300 block mb-1.5 font-medium">Keywords (comma-separated)</label>
                  <input
                    type="text"
                    value={keywordsStr}
                    onChange={e => setKeywordsStr(e.target.value)}
                    placeholder="portfolio, web developer, full stack"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors"
                  />
                </div>
              </div>

              {/* Favicon & Site Icons */}
              <div className="border-t border-white/10 pt-5 space-y-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Website Favicon / Icon</h3>
                <p className="text-xs text-gray-500">Upload a single PNG, SVG, or ICO file. It automatically reflects as the primary favicon, shortcut icon, and Apple touch icon.</p>
                
                <ImageUploader
                  label="Website Favicon / Icon (PNG/SVG/ICO)"
                  currentUrl={faviconUrl}
                  folder="favicons"
                  onFileSelect={(file, preview) => {
                    setPendingFaviconFile(file);
                    setFaviconUrl(preview);
                  }}
                  accept="image/*,.ico,.svg"
                />
              </div>

              {/* OpenGraph Metadata */}
              <div className="border-t border-white/10 pt-5 space-y-4">
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">OpenGraph (Social Cards)</h3>
                <div>
                  <label className="text-sm text-gray-300 block mb-1.5">OpenGraph Title</label>
                  <input
                    type="text"
                    value={ogTitle}
                    onChange={e => setOgTitle(e.target.value)}
                    placeholder="Same as Website Title if left blank"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-300 block mb-1.5">OpenGraph Description</label>
                  <textarea
                    value={ogDescription}
                    onChange={e => setOgDescription(e.target.value)}
                    rows={2}
                    placeholder="Same as Meta Description if left blank"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors resize-none"
                  />
                </div>
              </div>
            </section>

            {/* Website Logos & Branding Section */}
            <section className="bg-[#111] border border-white/10 rounded-2xl p-6 space-y-5">
              <div className="border-b border-white/10 pb-3">
                <h2 className="text-sm font-semibold text-gray-300 uppercase tracking-wider">Website Logos & Branding</h2>
                <p className="text-xs text-gray-500 mt-1">Upload custom PNG or SVG logos for your website navigation header and hero banner.</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <ImageUploader
                  label="Navbar Top-Left Logo (PNG/SVG)"
                  currentUrl={navbarLogoUrl}
                  folder="logos"
                  onFileSelect={(file, preview) => {
                    setPendingNavbarLogoFile(file);
                    setNavbarLogoUrl(preview);
                  }}
                  accept="image/*,.svg"
                />

                <ImageUploader
                  label="Main Hero Banner Logo (PNG/SVG)"
                  currentUrl={bannerLogoUrl}
                  folder="logos"
                  onFileSelect={(file, preview) => {
                    setPendingBannerLogoFile(file);
                    setBannerLogoUrl(preview);
                  }}
                  accept="image/*,.svg"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
                <button
                  type="button"
                  onClick={handleCancelMetadata}
                  disabled={savingMeta}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-xs sm:text-sm hover:border-white/30 transition-colors text-white disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingMeta}
                  className="px-6 py-2.5 bg-gradient-to-r from-pink-500 to-orange-500 rounded-xl text-xs sm:text-sm font-semibold disabled:opacity-50 hover:scale-105 transition-transform text-white shadow-lg"
                >
                  {savingMeta ? 'Saving Metadata...' : metaSaved ? '✓ Saved!' : 'Save Metadata & Logos'}
                </button>
              </div>
            </section>
          </form>

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
                    <label className="text-sm text-gray-300 block mb-1.5 font-medium">Admin Email</label>
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
                    <label className="text-sm text-gray-300 block mb-1.5 font-medium">6-Digit OTP</label>
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
                    <label className="text-sm text-gray-300 block mb-1.5 font-medium">New Password</label>
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
              onFileSelect={(file, previewUrl) => {
                setPendingCursorFile(file);
                setCursorUrl(previewUrl);
              }}
              accept="image/*"
            />
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancelCursor}
                disabled={savingCursor}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-xs sm:text-sm hover:border-white/30 transition-colors text-white disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCursor}
                disabled={savingCursor || (!pendingCursorFile && cursorUrl === initialCursorUrl)}
                className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-orange-500 rounded-xl text-xs sm:text-sm font-semibold disabled:opacity-50 hover:scale-105 transition-transform text-white"
              >
                {savingCursor ? 'Saving...' : cursorSaved ? '✓ Saved!' : 'Save Changes'}
              </button>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
