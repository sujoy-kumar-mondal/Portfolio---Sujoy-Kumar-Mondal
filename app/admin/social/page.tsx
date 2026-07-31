'use client';
import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/Sidebar';

interface SocialLink {
  _id?: string;
  platform: string;
  url: string;
  svgPath: string;
  hoverColor: string;
  order: number;
  isActive: boolean;
  position: 'top' | 'right';
}

const PRESET_ICONS: Record<string, { svgPath: string; hoverColor: string; position: 'top' | 'right'}> = {
  Phone: { position: 'top', hoverColor: '#00FFE1', svgPath: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="24" height="24"><path fill="currentColor" d="M164.9 24.6c-7.7-18.6-28-28.5-47.4-23.2l-88 24C12.1 30.2 0 46 0 64C0 311.4 200.6 512 448 512c18 0 33.8-12.1 38.6-29.5l24-88c5.3-19.4-4.6-39.7-23.2-47.4l-96-40c-16.3-6.8-35.2-2.1-46.3 11.6L304.7 368C234.3 334.7 177.3 277.7 144 207.3L193.3 167c13.7-11.2 18.4-30 11.6-46.3l-40-96z"/></svg>' },
  WhatsApp: { position: 'top', hoverColor: '#25D366', svgPath: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="24" height="24"><path fill="currentColor" d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/></svg>' },
  LinkedIn: { position: 'right', hoverColor: '#0077B5', svgPath: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="24" height="24"><path fill="currentColor" d="M100.3 448H7.4V148.9h92.9zM53.8 108.1C24.1 108.1 0 83.5 0 53.8a53.8 53.8 0 0 1 107.6 0c0 29.7-24.1 54.3-53.8 54.3zM447.9 448h-92.7V302.4c0-34.7-.7-79.2-48.3-79.2-48.3 0-55.7 37.7-55.7 76.7V448h-92.8V148.9h89.1v40.8h1.3c12.4-23.5 42.7-48.3 87.9-48.3 94 0 111.3 61.9 111.3 142.3V448z"/></svg>' },
  GitHub: { position: 'right', hoverColor: '#4078c0', svgPath: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" width="24" height="24"><path fill="currentColor" d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-14.3-112.3-110.5 0-27.5 7.6-41.3 23.6-58.9-2.6-6.5-11.1-33.3 2.6-67.9 20.9-6.5 69 27 69 27 20-5.6 41.5-8.5 62.8-8.5s42.8 2.9 62.8 8.5c0 0 48.1-33.6 69-27 13.7 34.7 5.2 61.4 2.6 67.9 16 17.7 25.8 31.5 25.8 58.9 0 96.5-58.9 104.2-114.8 110.5 9.2 7.9 17 22.9 17 46.4 0 33.7-.3 75.4-.3 83.6 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 383.5 8 244.8 8z"/></svg>' },
  X: { position: 'right', hoverColor: '#ffffff', svgPath: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="24" height="24"><path fill="currentColor" d="M389.2 48h70.6L305.6 224.2 487 464H345L233.7 318.6 106.5 464H35.8L200.7 275.5 26.8 48H172.4L272.9 180.9 389.2 48zM364.4 421.8h39.1L151.1 88h-42L364.4 421.8z"/></svg>' },
  Instagram: { position: 'right', hoverColor: '#E1306C', svgPath: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" width="24" height="24"><path fill="currentColor" d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"/></svg>' },
  YouTube: { position: 'right', hoverColor: '#FF0000', svgPath: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" width="24" height="24"><path fill="currentColor" d="M549.7 124.1c-6.3-23.7-24.8-42.3-48.3-48.6C458.8 64 288 64 288 64S117.2 64 74.6 75.5c-23.5 6.3-42 24.9-48.3 48.6-11.4 42.9-11.4 132.3-11.4 132.3s0 89.4 11.4 132.3c6.3 23.7 24.8 41.5 48.3 47.8C117.2 448 288 448 288 448s170.8 0 213.4-11.5c23.5-6.3 42-24.2 48.3-47.8 11.4-42.9 11.4-132.3 11.4-132.3s0-89.4-11.4-132.3zm-317.5 213.5V175.2l142.7 81.2-142.7 81.2z"/></svg>' },
  Facebook: { position: 'right', hoverColor: '#1877F2', svgPath: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="24" height="24"><path fill="currentColor" d="M512 256C512 114.6 397.4 0 256 0S0 114.6 0 256C0 376 82.7 476.8 194.2 504.5V334.2H141.4V256h52.8V222.3c0-87.1 39.4-127.5 125-127.5c16.2 0 44.2 3.2 55.7 6.4V172c-6-.6-16.5-1-29.6-1c-42 0-58.2 15.9-58.2 57.2V256h83.6l-14.4 78.2H287V510.1C413.8 494.8 512 386.9 512 256h0z"/></svg>' },
  Email: { position: 'right', hoverColor: '#4285F4', svgPath: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="24" height="24"><path fill="currentColor" d="M64 112c-8.8 0-16 7.2-16 16v22.1L220.5 291.7c20.7 17 50.4 17 71.1 0L464 150.1V128c0-8.8-7.2-16-16-16H64zM48 212.2V384c0 8.8 7.2 16 16 16H448c8.8 0 16-7.2 16-16V212.2L322 328.8c-38.4 31.5-93.7 31.5-132 0L48 212.2zM0 128C0 92.7 28.7 64 64 64H448c35.3 0 64 28.7 64 64V384c0 35.3-28.7 64-64 64H64c-35.3 0-64-28.7-64-64V128z"/></svg>' },
};

const emptyLink: SocialLink = { platform: '', url: '', svgPath: '', hoverColor: '#ffffff', order: 0, isActive: true, position: 'right' };

export default function AdminSocialPage() {
  const [links, setLinks] = useState<SocialLink[]>([]);
  const [editing, setEditing] = useState<SocialLink | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'top' | 'right'>('top');

  useEffect(() => {
    fetch('/api/admin/social').then(r => r.json()).then(socialData => {
      if (Array.isArray(socialData)) setLinks(socialData);
      setLoading(false);
    });
  }, []);

  const refresh = () => fetch('/api/admin/social').then(r => r.json()).then(setLinks);

  const handlePreset = (platform: string) => {
    const preset = PRESET_ICONS[platform];
    if (preset) {
      setEditing(e => e ? {
        ...e,
        platform,
        svgPath: preset.svgPath,
        hoverColor: preset.hoverColor,
        url: e.url || '',
        position: preset.position || 'right',
      } : e);
    }
  };

  const save = async () => {
    if (!editing) return;
    setSaving(true);
    const method = isNew ? 'POST' : 'PUT';
    const body = isNew ? editing : { id: editing._id, ...editing };
    await fetch('/api/admin/social', { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

    setSaving(false);
    setEditing(null);
    setIsNew(false);
    refresh();
  };

  const del = async (id: string) => {
    if (!confirm('Delete this social link?')) return;
    await fetch('/api/admin/social', { method: 'DELETE', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id }) });
    refresh();
  };

  const toggleActive = async (link: SocialLink) => {
    await fetch('/api/admin/social', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: link._id, isActive: !link.isActive }) });
    refresh();
  };

  const filteredLinks = links.filter(l => {
    if (activeTab === 'top') return l.position === 'top';
    if (activeTab === 'right') return l.position === 'right' || !l.position;
    return true;
  });

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#0a0a0a]">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0">
        <div className="max-w-3xl mx-auto space-y-6">
          {/* Sticky Header */}
          <div className="sticky top-0 z-30 bg-[#0a0a0a] py-4 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-white">Social Links & Contact Icons</h1>
              <p className="text-gray-500 text-xs sm:text-sm">Manage links for Top Navbar and Right Side Floating Dock</p>
            </div>
            <button
              onClick={() => { setEditing({ ...emptyLink }); setIsNew(true); }}
              className="px-4 py-2.5 bg-gradient-to-r from-pink-500 to-orange-500 rounded-xl text-xs sm:text-sm font-semibold hover:scale-105 transition-transform text-white self-start sm:self-auto flex-shrink-0"
            >
              + Add Social Link
            </button>
          </div>

          {/* Categorized Filter Tabs */}
          <div className="flex items-center gap-2 border-b border-white/10 pb-3 overflow-x-auto">
            <button
              onClick={() => setActiveTab('top')}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${activeTab === 'top' ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'text-gray-400 hover:text-white'}`}
            >
              Top Navbar ({links.filter(l => l.position === 'top').length})
            </button>
            <button
              onClick={() => setActiveTab('right')}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors ${activeTab === 'right' ? 'bg-blue-500/20 text-blue-300 border border-blue-500/40' : 'text-gray-400 hover:text-white'}`}
            >
              Right Side Dock ({links.filter(l => l.position === 'right' || !l.position).length})
            </button>
          </div>

          {/* Social Links List */}
          <section className="space-y-4">
            {loading ? (
              <div className="flex justify-center py-20"><div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" /></div>
            ) : (
              <div className="space-y-3">
                {filteredLinks.map(link => {
                  const pos = link.position || 'right';
                  return (
                    <div key={link._id} className={`bg-[#111] border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 ${link.isActive ? 'border-white/10' : 'border-white/5 opacity-50'}`}>
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center text-gray-400" dangerouslySetInnerHTML={{ __html: link.svgPath }} style={{ color: link.hoverColor }} />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="font-medium text-white text-sm">{link.platform}</p>
                            <span className={`text-[10px] px-2 py-0.5 rounded-md border font-mono ${
                              pos === 'top'
                                ? 'bg-cyan-500/10 border-cyan-500/30 text-cyan-300'
                                : 'bg-blue-500/10 border-blue-500/30 text-blue-300'
                            }`}>
                              {pos === 'top' ? 'Top Navbar' : 'Right Side'}
                            </span>
                          </div>
                          <p className="text-gray-500 text-xs truncate mt-0.5">{link.url}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-white/5">
                        <button onClick={() => toggleActive(link)} className={`text-xs px-2.5 py-1 rounded border transition-colors ${link.isActive ? 'border-green-500/30 text-green-400' : 'border-white/10 text-gray-600'}`}>
                          {link.isActive ? 'Active' : 'Hidden'}
                        </button>
                        <button onClick={() => { setEditing({ ...link, position: link.position || 'right' }); setIsNew(false); }} className="text-xs px-3 py-1 bg-white/10 hover:bg-white/20 rounded transition-colors text-white">Edit</button>
                        <button onClick={() => del(link._id!)} className="text-xs px-2.5 py-1 text-gray-500 hover:text-red-400 transition-colors">✕</button>
                      </div>
                    </div>
                  );
                })}
                {filteredLinks.length === 0 && <div className="text-center py-16 text-gray-600">No social links in this category. Click &quot;Add Social Link&quot; to add one.</div>}
              </div>
            )}
          </section>
        </div>

        {/* Edit Modal */}
        {editing && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={e => { if (e.target === e.currentTarget) { setEditing(null); setIsNew(false); } }}>
            <div className="bg-[#111] border border-white/10 rounded-2xl p-5 sm:p-6 w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
              <h2 className="text-lg font-semibold">{isNew ? 'Add Social Link' : 'Edit Social Link'}</h2>

              <div>
                <label className="text-xs text-gray-400 block mb-1.5">Quick Preset (optional)</label>
                <div className="flex flex-wrap gap-2">
                  {Object.keys(PRESET_ICONS).map(p => (
                    <button key={p} onClick={() => handlePreset(p)} className="px-2.5 py-1 rounded border border-white/10 text-xs hover:border-pink-500/50 transition-colors text-gray-300">{p}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1.5 font-medium">Placement / Location *</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setEditing(p => p ? { ...p, position: 'top' } : p)}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium transition-colors ${
                      editing.position === 'top'
                        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-300'
                        : 'border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    Top Navbar
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditing(p => p ? { ...p, position: 'right' } : p)}
                    className={`py-2 px-3 rounded-xl border text-xs font-medium transition-colors ${
                      editing.position === 'right'
                        ? 'bg-blue-500/20 border-blue-500/50 text-blue-300'
                        : 'border-white/10 text-gray-400 hover:text-white'
                    }`}
                  >
                    Right Side Dock
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs text-gray-400 block mb-1.5">Platform Name *</label>
                <input type="text" value={editing.platform} onChange={e => setEditing(p => p ? { ...p, platform: e.target.value } : p)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors" placeholder="e.g. LinkedIn, Phone, WhatsApp" />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1.5 font-medium">
                  URL / Phone Number *
                </label>
                <input type="text" value={editing.url} onChange={e => setEditing(p => p ? { ...p, url: e.target.value } : p)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors" placeholder="https://... or tel:+91..." />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1.5">SVG Icon (HTML) *</label>
                <textarea rows={4} value={editing.svgPath} onChange={e => setEditing(p => p ? { ...p, svgPath: e.target.value } : p)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-mono focus:outline-none focus:border-pink-500/50 transition-colors resize-none text-xs"
                  placeholder="<svg xmlns=...>...</svg>" />
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1.5">Hover Color</label>
                <div className="flex gap-3 items-center">
                  <input type="color" value={editing.hoverColor} onChange={e => setEditing(p => p ? { ...p, hoverColor: e.target.value } : p)} className="w-10 h-10 rounded cursor-pointer bg-transparent border-0" />
                  <input type="text" value={editing.hoverColor} onChange={e => setEditing(p => p ? { ...p, hoverColor: e.target.value } : p)}
                    className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors" />
                </div>
              </div>
              <div>
                <label className="text-xs text-gray-400 block mb-1.5">Display Order</label>
                <input type="number" value={editing.order} onChange={e => setEditing(p => p ? { ...p, order: parseInt(e.target.value) || 0 } : p)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors" />
              </div>
              <div className="flex gap-3 pt-2">
                <button onClick={() => { setEditing(null); setIsNew(false); }} className="flex-1 py-2.5 rounded-xl border border-white/10 text-sm hover:border-white/30 transition-colors text-white">Cancel</button>
                <button onClick={save} disabled={saving} className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-pink-500 to-orange-500 text-sm font-semibold disabled:opacity-50 text-white">
                  {saving ? 'Saving...' : 'Save Link'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
