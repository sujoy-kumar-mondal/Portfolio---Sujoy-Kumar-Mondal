'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';

export default function GetInTouch({ title }: { title?: string }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setStatus('success');
        setForm({ name: '', email: '', phone: '', message: '' });
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
    setTimeout(() => setStatus('idle'), 4000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="relative h-auto min-h-[480px] w-full max-w-[380px] mx-auto border-2 rounded-2xl bg-gradient-to-tl from-pink-500 to-orange-500 p-4 sm:p-6 shadow-2xl"
    >
      <h3 className="text-2xl font-bold mb-1">{title || 'Get in Touch'}</h3>
      <div className="border-b border-white/30 mb-4" />
      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          type="text"
          placeholder="Enter Your Name"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
          className="bg-white text-black w-full rounded-2xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
        <input
          type="email"
          placeholder="Enter Your Mail Id"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
          className="bg-white text-black w-full rounded-2xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
        <input
          type="tel"
          placeholder="Enter Your Contact No"
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          className="bg-white text-black w-full rounded-2xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300"
        />
        <textarea
          placeholder="Enter Your Message"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          required
          rows={6}
          className="bg-white text-black w-full rounded-2xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-300 resize-none"
        />
        <div className="flex items-center justify-between mt-1">
          {status === 'success' && <span className="text-green-900 text-sm font-medium">✓ Message sent!</span>}
          {status === 'error' && <span className="text-red-900 text-sm font-medium">✗ Failed to send</span>}
          {(status === 'idle' || status === 'sending') && <span />}
          <button
            type="submit"
            disabled={status === 'sending'}
            className="bg-white text-black rounded px-4 py-2 text-sm font-semibold hover:bg-gray-100 disabled:opacity-60 transition-colors ml-auto"
          >
            {status === 'sending' ? 'Sending...' : 'Submit Form'}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
