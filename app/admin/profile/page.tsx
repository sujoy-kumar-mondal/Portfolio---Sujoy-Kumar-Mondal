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
            <button
              onClick={save}
              disabled={saving}
              className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-orange-500 rounded-xl text-sm font-semibold disabled:opacity-50 hover:scale-105 transition-transform text-white flex-shrink-0"
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

          {/* Skills / Tags */}
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

          {/* Uploads (Profile Photo & CV) */}
          <section className="bg-[#111] border border-white/10 rounded-2xl p-6 space-y-6">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">File Uploads</h2>
            <ImageUploader label="Profile Photo" currentUrl={profile.photoUrl} folder="profile" onUpload={url => setProfile(p => ({ ...p, photoUrl: url }))} />
            <ImageUploader label="CV / Resume (PDF)" currentUrl={profile.cvUrl} folder="cv" resourceType="raw" onUpload={url => setProfile(p => ({ ...p, cvUrl: url }))} accept=".pdf" />
          </section>
        </div>
      </main>
    </div>
  );
}
