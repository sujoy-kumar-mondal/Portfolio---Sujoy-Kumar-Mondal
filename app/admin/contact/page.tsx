'use client';
import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/Sidebar';

interface ContactInfo {
  address: string;
  addressMapUrl: string;
  mapEmbedUrl: string;
  phone: string;
  whatsapp: string;
  email: string;
  contactFormRecipient: string;
  getInTouchTitle: string;
  letsMeetTitle: string;
}

export default function AdminContactPage() {
  const [info, setInfo] = useState<ContactInfo>({
    address: '', addressMapUrl: '', mapEmbedUrl: '', phone: '', whatsapp: '', email: '',
    contactFormRecipient: '', getInTouchTitle: 'Get in Touch', letsMeetTitle: "Let's Meet",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/contact').then(r => r.json()).then(data => {
      if (data) setInfo({ ...data, whatsapp: data.whatsapp || data.phone || '' });
      setLoading(false);
    });
  }, []);

  const save = async () => {
    setSaving(true);
    const res = await fetch('/api/admin/contact', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(info) });
    setSaving(false);
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
  };

  const set = (key: keyof ContactInfo) => (val: string) => setInfo(i => ({ ...i, [key]: val }));

  if (loading) return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#0a0a0a]">
      <AdminSidebar />
      <main className="flex-1 p-8 flex items-center justify-center"><div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" /></main>
    </div>
  );

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-[#0a0a0a]">
      <AdminSidebar />
      <main className="flex-1 p-4 sm:p-6 md:p-8 min-w-0 overflow-x-hidden overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-white">Contact Info</h1>
              <p className="text-gray-500 text-sm">Update Get in Touch & Let&apos;s Meet sections</p>
            </div>
            <button onClick={save} disabled={saving} className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-orange-500 rounded-xl text-sm font-semibold disabled:opacity-50 hover:scale-105 transition-transform text-white self-start sm:self-auto">
              {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
            </button>
          </div>

          {/* Get in Touch */}
          <section className="bg-[#111] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Get in Touch Section</h2>
            <div>
              <label className="text-sm text-gray-300 block mb-1.5">Section Title</label>
              <input type="text" value={info.getInTouchTitle} onChange={e => set('getInTouchTitle')(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors" />
            </div>
            <div>
              <label className="text-sm text-gray-300 block mb-1.5">Contact Form Email Recipient</label>
              <input type="email" value={info.contactFormRecipient} onChange={e => set('contactFormRecipient')(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors"
                placeholder="Where should contact form messages be sent?" />
            </div>
          </section>

          {/* Let's Meet */}
          <section className="bg-[#111] border border-white/10 rounded-2xl p-5 sm:p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Let&apos;s Meet Section</h2>
            <div>
              <label className="text-sm text-gray-300 block mb-1.5">Section Title</label>
              <input type="text" value={info.letsMeetTitle} onChange={e => set('letsMeetTitle')(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors" />
            </div>
            <div>
              <label className="text-sm text-gray-300 block mb-1.5">Address (text)</label>
              <textarea value={info.address} onChange={e => set('address')(e.target.value)} rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors resize-none" />
            </div>
            <div>
              <label className="text-sm text-gray-300 block mb-1.5">Address Maps Link (click destination)</label>
              <input type="url" value={info.addressMapUrl} onChange={e => set('addressMapUrl')(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors"
                placeholder="https://maps.app.goo.gl/..." />
            </div>
            <div>
              <label className="text-sm text-gray-300 block mb-1.5">Map Embed URL (iframe src)</label>
              <input type="url" value={info.mapEmbedUrl} onChange={e => set('mapEmbedUrl')(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors font-mono text-xs"
                placeholder="https://www.google.com/maps/embed?..." />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-300 block mb-1.5">Phone Number</label>
                <input type="tel" value={info.phone} onChange={e => set('phone')(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors" />
              </div>
              <div>
                <label className="text-sm text-gray-300 block mb-1.5">WhatsApp Number</label>
                <input type="tel" value={info.whatsapp} onChange={e => set('whatsapp')(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors" />
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-300 block mb-1.5">Display Email Address</label>
              <input type="email" value={info.email} onChange={e => set('email')(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors" />
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
