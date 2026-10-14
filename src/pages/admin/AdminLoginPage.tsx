import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { BrandLogo } from '../../components/common/BrandLogo';
import {
  Lock,
  Mail,
  AlertCircle,
  Loader2,
  ArrowRight,
  CheckCircle,
  UserPlus,
  ShieldCheck,
  HelpCircle,
} from 'lucide-react';

type Mode = 'login' | 'setup' | 'reset';

export const AdminLoginPage: React.FC = () => {
  const { currentUser, isAdmin, login, signUp, resetPassword, designatedAdminEmail } = useAuth();
  const [email, setEmail] = useState(designatedAdminEmail);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [mode, setMode] = useState<Mode>('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [infoNotice, setInfoNotice] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);

  const navigate = useNavigate();

  // If already logged in and admin, redirect
  if (currentUser && isAdmin) {
    return <Navigate to="/admin" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoNotice(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Please provide an email address.');
      return;
    }

    if (cleanEmail.toLowerCase() !== designatedAdminEmail.toLowerCase()) {
      setError(`Access is restricted to designated administrator (${designatedAdminEmail}).`);
      return;
    }

    setLoading(true);

    try {
      if (mode === 'reset') {
        await resetPassword(cleanEmail);
        setResetSent(true);
        setLoading(false);
        return;
      }

      if (mode === 'setup') {
        if (password.length < 6) {
          setError('Password must be at least 6 characters long.');
          setLoading(false);
          return;
        }
        if (confirmPassword && password !== confirmPassword) {
          setError('Passwords do not match. Please re-enter.');
          setLoading(false);
          return;
        }

        await signUp(cleanEmail, password);
        navigate('/admin');
        return;
      }

      // Default: login
      await login(cleanEmail, password);
      navigate('/admin');
    } catch (err: any) {
      console.error('Admin authentication error:', err);
      const code = err?.code || '';
      const message = err?.message || '';

      if (code === 'auth/invalid-credential' || code === 'auth/user-not-found' || code === 'auth/wrong-password') {
        if (mode === 'login') {
          setError('Incorrect password or account does not exist yet.');
          setInfoNotice('If you haven\'t created an admin password yet, click "First-Time Setup" below to create it.');
        } else {
          setError('Invalid credentials provided.');
        }
      } else if (code === 'auth/email-already-in-use') {
        setError('This admin email already has an account in Firebase Auth.');
        setInfoNotice('Please switch to "Sign In" mode and enter your password.');
        setMode('login');
      } else if (code === 'auth/operation-not-allowed') {
        setError(
          'Email/Password provider is disabled in Firebase Console. Go to Firebase Console -> Authentication -> Sign-in method -> Enable "Email/Password".'
        );
      } else if (code === 'auth/weak-password') {
        setError('Password is too weak. Please use at least 6 characters.');
      } else if (code === 'auth/too-many-requests') {
        setError('Too many failed attempts. Access temporarily locked for safety. Please try again in a few minutes or reset your password.');
      } else if (code === 'auth/network-request-failed') {
        setError('Network error. Please check your internet connection.');
      } else {
        setError(message || 'Authentication error. Please verify your Firebase project credentials.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F5EF] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <BrandLogo showTagline={true} />
        <h2 className="mt-6 font-serif text-3xl font-semibold text-[#234737]">
          {mode === 'setup'
            ? 'First-Time Admin Setup'
            : mode === 'reset'
            ? 'Reset Admin Password'
            : 'Store Administrator'}
        </h2>
        <p className="mt-2 text-xs text-[#252A24]/70">
          Firebase Authentication & Catalog Operations for DripNest
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-[#EFE6D7] rounded-xl sm:px-10 space-y-6">
          {/* Mode Tabs */}
          <div className="grid grid-cols-2 p-1 bg-[#F8F5EF] rounded-lg border border-[#EFE6D7] text-xs">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
                setInfoNotice(null);
                setResetSent(false);
              }}
              className={`py-2 font-semibold rounded-md transition-all ${
                mode === 'login'
                  ? 'bg-white text-[#234737] shadow-xs'
                  : 'text-[#252A24]/70 hover:text-[#234737]'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('setup');
                setError(null);
                setInfoNotice(null);
                setResetSent(false);
              }}
              className={`py-2 font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
                mode === 'setup'
                  ? 'bg-white text-[#234737] shadow-xs'
                  : 'text-[#252A24]/70 hover:text-[#234737]'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>First-Time Setup</span>
            </button>
          </div>

          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
              <div className="space-y-1">
                <span className="font-medium block">{error}</span>
                {infoNotice && (
                  <p className="text-red-800 text-[11px] pt-1 border-t border-red-200/80">
                    {infoNotice}
                  </p>
                )}
              </div>
            </div>
          )}

          {resetSent ? (
            <div className="text-center py-4 space-y-3">
              <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                <CheckCircle className="w-6 h-6" />
              </div>
              <p className="text-xs text-[#252A24]/80 leading-relaxed">
                A password reset email has been dispatched to <strong>{email}</strong>. Please check your inbox or spam folder to set a new password.
              </p>
              <button
                type="button"
                onClick={() => {
                  setResetSent(false);
                  setMode('login');
                }}
                className="text-xs text-[#234737] font-semibold underline"
              >
                Return to Sign In
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#684631]" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="ubaidji07@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-sm text-[#252A24] focus:outline-none focus:border-[#234737] focus:ring-1 focus:ring-[#234737]"
                  />
                </div>
                <p className="text-[11px] text-[#252A24]/60 mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#234737]" />
                  <span>Only {designatedAdminEmail} is authorized</span>
                </p>
              </div>

              {mode !== 'reset' && (
                <div>
                  <div className="flex justify-between items-baseline mb-1">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631]">
                      {mode === 'setup' ? 'Create Password (min. 6 chars)' : 'Password'}
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode('reset');
                          setError(null);
                        }}
                        className="text-[11px] text-[#234737] hover:underline"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#684631]" />
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-sm text-[#252A24] focus:outline-none focus:border-[#234737] focus:ring-1 focus:ring-[#234737]"
                    />
                  </div>
                </div>
              )}

              {mode === 'setup' && (
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-[#684631] mb-1">
                    Confirm Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#684631]" />
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full pl-10 pr-3.5 py-2.5 bg-[#F8F5EF] border border-[#EFE6D7] rounded-md text-sm text-[#252A24] focus:outline-none focus:border-[#234737] focus:ring-1 focus:ring-[#234737]"
                    />
                  </div>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 bg-[#234737] text-white text-xs uppercase tracking-widest font-semibold rounded-md hover:bg-[#1A3529] disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>
                        {mode === 'setup'
                          ? 'Create Admin Account'
                          : mode === 'reset'
                          ? 'Send Password Reset Link'
                          : 'Sign In to Dashboard'}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>

              {mode === 'reset' && (
                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setError(null);
                    }}
                    className="text-xs text-[#252A24]/70 hover:text-[#234737] underline"
                  >
                    Cancel and return to sign in
                  </button>
                </div>
              )}
            </form>
          )}

          {/* Quick Guidance Box */}
          <div className="pt-4 border-t border-[#EFE6D7] bg-[#F8F5EF]/60 -mx-6 -mb-8 p-4 rounded-b-xl text-[11px] text-[#252A24]/70 space-y-1.5">
            <div className="flex items-center gap-1.5 font-medium text-[#234737]">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>First time accessing the admin portal?</span>
            </div>
            <p className="leading-relaxed">
              If you haven't created a password for <span className="font-mono text-[#234737]">ubaidji07@gmail.com</span> yet, switch to <strong>First-Time Setup</strong> tab to create it, or use <strong>Forgot password?</strong> to receive a reset link directly in your inbox.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
