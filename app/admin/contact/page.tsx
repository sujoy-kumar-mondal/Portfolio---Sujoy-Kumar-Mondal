'use client';
import { useState, useEffect } from 'react';
import AdminSidebar from '@/components/admin/Sidebar';

interface ContactInfo {
  address: string;
  addressMapUrl: string;
  mapEmbedUrl: string;
  phone: string;
  email: string;
  contactFormRecipient: string;
  getInTouchTitle: string;
  letsMeetTitle: string;
}

export default function AdminContactPage() {
  const [info, setInfo] = useState<ContactInfo>({
    address: '', addressMapUrl: '', mapEmbedUrl: '', phone: '', email: '',
    contactFormRecipient: '', getInTouchTitle: 'Get in Touch', letsMeetTitle: "Let's Meet",
  });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/admin/contact').then(r => r.json()).then(data => { setInfo(data); setLoading(false); });
  }, []);

  const save = async () => {
    setSaving(true);
    const res = await fetch('/api/admin/contact', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(info) });
    setSaving(false);
    if (res.ok) { setSaved(true); setTimeout(() => setSaved(false), 3000); }
  };

  const set = (key: keyof ContactInfo) => (val: string) => setInfo(i => ({ ...i, [key]: val }));

  if (loading) return (
    <div className="flex"><AdminSidebar />
      <main className="flex-1 p-8 flex items-center justify-center"><div className="w-8 h-8 border-2 border-pink-500 border-t-transparent rounded-full animate-spin" /></main>
    </div>
  );

  return (
    <div className="flex">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-white">Contact Info</h1>
              <p className="text-gray-500 text-sm">Update Get in Touch & Let&apos;s Meet sections</p>
            </div>
            <button onClick={save} disabled={saving} className="px-5 py-2.5 bg-gradient-to-r from-pink-500 to-orange-500 rounded-xl text-sm font-semibold disabled:opacity-50 hover:scale-105 transition-transform text-white">
              {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
            </button>
          </div>

          {/* Get in Touch */}
          <section className="bg-[#111] border border-white/10 rounded-2xl p-6 space-y-4">
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
                placeholder="Where should contact form emails go?" />
              <p className="text-xs text-gray-600 mt-1">Contact form submissions will be sent to this address</p>
            </div>
          </section>

          {/* Let's Meet */}
          <section className="bg-[#111] border border-white/10 rounded-2xl p-6 space-y-4">
            <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">Let&apos;s Meet Section</h2>
            <div>
              <label className="text-sm text-gray-300 block mb-1.5">Section Title</label>
              <input type="text" value={info.letsMeetTitle} onChange={e => set('letsMeetTitle')(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors" />
            </div>
            <div>
              <label className="text-sm text-gray-300 block mb-1.5">Address Text</label>
              <textarea value={info.address} onChange={e => set('address')(e.target.value)} rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors resize-none"
                placeholder="Vill: - Baruna, P.S: - Moyna..." />
            </div>
            <div>
              <label className="text-sm text-gray-300 block mb-1.5">Google Maps Link (Open in Maps button)</label>
              <input type="url" value={info.addressMapUrl} onChange={e => set('addressMapUrl')(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors"
                placeholder="https://maps.app.goo.gl/..." />
            </div>
            <div>
              <label className="text-sm text-gray-300 block mb-1.5">Google Maps Embed URL (iframe)</label>
              <textarea value={info.mapEmbedUrl} onChange={e => set('mapEmbedUrl')(e.target.value)} rows={3}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white font-mono text-xs focus:outline-none focus:border-pink-500/50 transition-colors resize-none"
                placeholder="https://www.google.com/maps/embed?pb=..." />
              <p className="text-xs text-gray-600 mt-1">Get this from Google Maps → Share → Embed a map → Copy the src URL</p>
            </div>
            <div>
              <label className="text-sm text-gray-300 block mb-1.5">Phone Number</label>
              <input type="tel" value={info.phone} onChange={e => set('phone')(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors"
                placeholder="+91 9002842851" />
            </div>
            <div>
              <label className="text-sm text-gray-300 block mb-1.5">Email Address</label>
              <input type="email" value={info.email} onChange={e => set('email')(e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-pink-500/50 transition-colors"
                placeholder="sujoy721642@gmail.com" />
            </div>
          </section>

          <button onClick={save} disabled={saving} className="w-full py-3 bg-gradient-to-r from-pink-500 to-orange-500 rounded-xl text-sm font-semibold disabled:opacity-50 hover:scale-[1.01] transition-transform text-white">
            {saving ? 'Saving...' : saved ? '✓ Changes Saved!' : 'Save All Changes'}
          </button>
        </div>
      </main>
    </div>
  );
}
