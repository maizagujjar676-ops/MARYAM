import React, { useState } from 'react';
import { Compass, X, Shield, Sparkles, AlertCircle, ArrowRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const { signInWithGoogle, signInAsGuest } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleSignIn = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      onSuccess();
      onClose();
    } catch (err: unknown) {
      console.error(err);
      setError('Google Sign-In failed or popup was closed. You can also explore instantly via Guest Demo mode.');
    } finally {
      setLoading(false);
    }
  };

  const handleGuestDemo = () => {
    signInAsGuest();
    onSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="relative w-full max-w-md rounded-2xl bg-white p-6 sm:p-8 shadow-2xl border border-gray-100">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full p-1.5 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-[#3563E9] text-white shadow-md shadow-[#3563E9]/25">
            <Compass className="h-6 w-6" />
          </div>
          <h2 className="mt-4 text-xl font-bold tracking-tight text-[#101828]">
            Welcome to LeadPilot AI
          </h2>
          <p className="mt-1 text-xs text-gray-500 max-w-xs mx-auto">
            Find Better Leads. Close More Deals. Access your B2B sales pipeline and AI discovery dashboard.
          </p>
        </div>

        {error && (
          <div className="mt-4 flex items-start gap-2.5 rounded-xl bg-red-50 p-3 text-xs text-red-700 border border-red-200">
            <AlertCircle className="h-4 w-4 shrink-0 text-red-600 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="mt-6 space-y-3">
          <button
            onClick={handleGoogleSignIn}
            disabled={loading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border border-gray-300 bg-white px-4 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 transition-all shadow-xs disabled:opacity-50"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            {loading ? 'Connecting Google Account...' : 'Continue with Google (Firebase)'}
          </button>

          <div className="relative my-4 flex items-center justify-center">
            <div className="w-full border-t border-gray-200" />
            <span className="absolute bg-white px-3 text-[11px] font-medium text-gray-400 uppercase tracking-wider">
              Or Instant Access
            </span>
          </div>

          <button
            onClick={handleGuestDemo}
            className="group flex w-full items-center justify-between rounded-xl bg-[#F2F6FF] px-4 py-3 text-left border border-blue-200 hover:bg-blue-100/70 transition-all"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#3563E9] text-white">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#101828]">
                  Explore in Live Sandbox Demo
                </p>
                <p className="text-[11px] text-gray-500">
                  Preloaded with realistic B2B prospects & CRM pipelines
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-[#3563E9] transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>

        <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
          <Shield className="h-3.5 w-3.5 text-gray-400" />
          <span>Zero spam. Enterprise Firebase Firestore encryption.</span>
        </div>
      </div>
    </div>
  );
};
