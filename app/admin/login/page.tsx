'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'login' | 'forgot'>('login');
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [forgotStep, setForgotStep] = useState<'request' | 'reset'>('request');

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState('');

  // Forgot password state
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Invalid credentials');
      setStep('otp');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await signIn('credentials', {
        email,
        password,
        otp,
        step: 'otp',
        redirect: false,
      });
      if (result?.error) {
        throw new Error('Invalid or expired OTP. Please try again.');
      }
      // router.refresh() tells Next.js to re-fetch server components & re-read
      // the new session cookie — no full page reload, fully SPA-compatible.
      router.refresh();
      router.push('/admin/dashboard');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'OTP verification failed');
    } finally {
      setLoading(false);
    }
  };


  const handleRequestForgotOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/admin/forgot-password/request-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      setSuccessMsg(data.message || 'OTP sent successfully!');
      setForgotStep('reset');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to request OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');
    try {
      const res = await fetch('/api/admin/forgot-password/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: forgotEmail,
          otp: forgotOtp,
          newPassword,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to reset password');
      setSuccessMsg('Password reset successfully! Please sign in with your new password.');
      setMode('login');
      setStep('credentials');
      setPassword('');
      setOtp('');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d0d0d] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-pink-500 to-orange-500 mb-4 shadow-xl">
            <svg width="28" viewBox="0 0 224 473" fill="white" xmlns="http://www.w3.org/2000/svg">
              <path d="M75 429L1 472V322L75 281V429Z" />
              <path d="M152 322V386L223 344V281L75 196V126L152 171V238.715L223 196V126L1 1V236L152 322Z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-white">Admin Panel</h1>
          <p className="text-gray-500 text-sm mt-1">SKM Portfolio</p>
        </div>

        <div className="bg-[#111] border border-white/10 rounded-2xl p-8 shadow-2xl">
          {successMsg && (
            <div className="mb-4 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm">
              {successMsg}
            </div>
          )}

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
              {error}
            </div>
          )}

          {mode === 'login' ? (
            step === 'credentials' ? (
              <>
                <h2 className="text-lg font-semibold mb-6 text-white">Sign In</h2>
                <form onSubmit={handleCredentials} className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 block mb-1.5">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      placeholder="admin@example.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/30 transition-colors"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-sm text-gray-400">Password</label>
                      <button
                        type="button"
                        onClick={() => { setMode('forgot'); setForgotStep('request'); setError(''); setSuccessMsg(''); }}
                        className="text-xs text-pink-400 hover:underline"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      placeholder="••••••••"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/30 transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 disabled:opacity-50 transition-all duration-150 mt-2 text-white"
                  >
                    {loading ? 'Sending OTP...' : 'Continue →'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <button onClick={() => { setStep('credentials'); setError(''); }} className="text-gray-500 hover:text-white transition-colors">
                    ← Back
                  </button>
                  <h2 className="text-lg font-semibold text-white">Enter OTP</h2>
                </div>
                <p className="text-gray-400 text-sm mb-6">
                  A 6-digit OTP was sent to <strong className="text-white">{email}</strong>. It expires in 10 minutes.
                </p>
                <form onSubmit={handleOTP} className="space-y-4">
                  <input
                    type="text"
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    required
                    maxLength={6}
                    placeholder="000000"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-3xl text-center font-bold tracking-[16px] text-white placeholder-gray-700 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/30 transition-colors"
                  />
                  <button
                    type="submit"
                    disabled={loading || otp.length !== 6}
                    className="w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 disabled:opacity-50 transition-all duration-150 text-white"
                  >
                    {loading ? 'Verifying OTP...' : 'Sign In'}
                  </button>
                  <button
                    type="button"
                    onClick={handleCredentials}
                    className="w-full text-xs text-gray-500 hover:text-white transition-colors"
                  >
                    Didn&apos;t receive OTP? Resend
                  </button>
                </form>
              </>
            )
          ) : (
            // FORGOT PASSWORD FLOW
            forgotStep === 'request' ? (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <button onClick={() => { setMode('login'); setError(''); setSuccessMsg(''); }} className="text-gray-500 hover:text-white transition-colors">
                    ← Back to Sign In
                  </button>
                  <h2 className="text-lg font-semibold text-white">Forgot Password</h2>
                </div>
                <p className="text-gray-400 text-sm mb-6">
                  Enter your admin email address to receive a 6-digit verification OTP.
                </p>
                <form onSubmit={handleRequestForgotOTP} className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 block mb-1.5">Admin Email</label>
                    <input
                      type="email"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      required
                      placeholder="admin@example.com"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-pink-500/50 focus:ring-1 focus:ring-pink-500/30 transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || !forgotEmail}
                    className="w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 disabled:opacity-50 transition-all duration-150 text-white"
                  >
                    {loading ? 'Sending Reset OTP...' : 'Send Reset OTP →'}
                  </button>
                </form>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-6">
                  <button onClick={() => { setForgotStep('request'); setError(''); }} className="text-gray-500 hover:text-white transition-colors">
                    ← Back
                  </button>
                  <h2 className="text-lg font-semibold text-white">Reset Password</h2>
                </div>
                <p className="text-gray-400 text-sm mb-6">
                  Enter the 6-digit OTP sent to <strong className="text-white">{forgotEmail}</strong> and your new password.
                </p>
                <form onSubmit={handleResetPassword} className="space-y-4">
                  <div>
                    <label className="text-sm text-gray-400 block mb-1.5">6-Digit OTP</label>
                    <input
                      type="text"
                      value={forgotOtp}
                      onChange={(e) => setForgotOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      required
                      maxLength={6}
                      placeholder="000000"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-2xl text-center font-bold tracking-[12px] text-white placeholder-gray-700 focus:outline-none focus:border-pink-500/50 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1.5">New Password</label>
                    <input
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      required
                      minLength={6}
                      placeholder="New password (min. 6 characters)"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-pink-500/50 transition-colors"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading || forgotOtp.length !== 6 || newPassword.length < 6}
                    className="w-full py-3 rounded-xl font-semibold text-sm bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600 disabled:opacity-50 transition-all duration-150 text-white"
                  >
                    {loading ? 'Resetting Password...' : 'Reset Password & Sign In'}
                  </button>
                </form>
              </>
            )
          )}
        </div>
      </div>
    </div>
  );
}
