'use client';
import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/Sidebar';
import ImageUploader, { uploadFileToCloudinary } from '@/components/admin/ImageUploader';

interface Profile {
  name: string;
  intro: string;
  about: string;
  photoUrl: string;
  cvUrl: string;
  skills: string[];
}

export default function AdminProfilePage() {
  const [profile, setProfile] = useState<Profile>({ name: '', intro: '', about: '', photoUrl: '', cvUrl: '', skills: [] });
  const [initialProfile, setInitialProfile] = useState<Profile>({ name: '', intro: '', about: '', photoUrl: '', cvUrl: '', skills: [] });

  const [pendingPhotoFile, setPendingPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState('');

  const [pendingCvFile, setPendingCvFile] = useState<File | null>(null);
  const [cvPreview, setCvPreview] = useState('');

  const [skillInput, setSkillInput] = useState('');
  const [skillError, setSkillError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/profile').then(r => r.json()).then(data => {
      if (data) {
        setProfile(data);
        setInitialProfile(data);
        setPhotoPreview(data.photoUrl || '');
        setCvPreview(data.cvUrl || '');
      }
      setLoading(false);
    });
  }, []);

  const addSkill = () => {
    const s = skillInput.trim();
    if (!s) return;

    const formatted = s.startsWith('#') ? s : `#${s}`;
    const exists = profile.skills.some(existing => existing.toLowerCase() === formatted.toLowerCase());

    if (exists) {
      setSkillError(`Skill / Tag "${formatted}" already exists.`);
      return;
    }

    setProfile(p => ({ ...p, skills: [...p.skills, formatted] }));
    setSkillInput('');
    setSkillError('');
  };

  const removeSkill = (skill: string) => {
    setProfile(p => ({ ...p, skills: p.skills.filter(s => s !== skill) }));
    setSkillError('');
  };


  const handleCancel = () => {
    setProfile(initialProfile);
    setPhotoPreview(initialProfile.photoUrl || '');
    setCvPreview(initialProfile.cvUrl || '');
    setPendingPhotoFile(null);
    setPendingCvFile(null);
  };

  const save = async () => {
    setSaving(true);
    try {
      let updatedPhotoUrl = profile.photoUrl;
      let updatedCvUrl = profile.cvUrl;

      // 1. Upload pending photo if selected
      if (pendingPhotoFile) {
        updatedPhotoUrl = await uploadFileToCloudinary(pendingPhotoFile, 'profile', 'image');
        if (initialProfile.photoUrl && initialProfile.photoUrl !== updatedPhotoUrl) {
          fetch('/api/admin/delete-asset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: initialProfile.photoUrl }),
          }).catch(console.error);
        }
      }

      // 2. Upload pending CV PDF if selected
      if (pendingCvFile) {
        updatedCvUrl = await uploadFileToCloudinary(pendingCvFile, 'cv', 'auto');
        if (initialProfile.cvUrl && initialProfile.cvUrl !== updatedCvUrl) {
          fetch('/api/admin/delete-asset', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ url: initialProfile.cvUrl }),
          }).catch(console.error);
        }
      }

      const updatedProfile = {
        ...profile,
        photoUrl: updatedPhotoUrl,
        cvUrl: updatedCvUrl,
      };

      const res = await fetch('/api/admin/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedProfile),
      });

      if (res.ok) {
        setProfile(updatedProfile);
        setInitialProfile(updatedProfile);
        setPendingPhotoFile(null);
        setPendingCvFile(null);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setSaving(false);
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
              <h1 className="text-xl sm:text-2xl font-bold text-white">Profile</h1>
              <p className="text-gray-500 text-xs sm:text-sm">Update your personal information & bio</p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="px-4 py-2.5 rounded-xl border border-white/10 text-xs sm:text-sm hover:border-white/30 transition-colors text-white disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={save}
                disabled={saving}
                className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-orange-500 rounded-xl text-xs sm:text-sm font-semibold disabled:opacity-50 hover:scale-105 transition-transform text-white"
              >
                {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
              </button>
            </div>
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

          {/* Skills / Tags */}
          <section className="bg-[#111] border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Skills / Tags</h2>
            <div>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={e => {
                    setSkillInput(e.target.value);
                    if (skillError) setSkillError('');
                  }}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  placeholder="python (# added automatically)"
                  className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors"
                />
                <button type="button" onClick={addSkill} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-sm transition-colors text-white">Add</button>
              </div>
              {skillError && <p className="text-xs text-red-400 mt-1.5 font-medium">{skillError}</p>}
            </div>
            <div className="flex flex-wrap gap-2">
              {profile.skills.map((skill, index) => (
                <span key={`${skill}-${index}`} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/20 text-xs text-gray-300">
                  {skill}
                  <button type="button" onClick={() => removeSkill(skill)} className="text-gray-600 hover:text-red-400 transition-colors">✕</button>
                </span>
              ))}
            </div>
          </section>


          {/* Uploads (Profile Photo & CV) */}
          <section className="bg-[#111] border border-white/10 rounded-2xl p-6 space-y-6">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">File Uploads</h2>
            <ImageUploader
              label="Profile Photo"
              currentUrl={photoPreview}
              folder="profile"
              onFileSelect={(file, previewUrl) => {
                setPendingPhotoFile(file);
                setPhotoPreview(previewUrl);
              }}
            />
            <ImageUploader
              label="CV / Resume (PDF)"
              currentUrl={cvPreview}
              folder="cv"
              resourceType="auto"
              accept=".pdf"
              onFileSelect={(file, previewUrl) => {
                setPendingCvFile(file);
                setCvPreview(previewUrl);
              }}
            />
          </section>
        </div>
      </main>
    </div>
  );
}
