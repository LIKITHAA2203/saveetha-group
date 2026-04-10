import React, { useState } from 'react';
import { ShoppingCart, ArrowRight, Loader2 } from 'lucide-react';
import { auth, googleProvider } from '../firebase';
import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';

interface LoginProps {
  onLogin: (user: any) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      // The user state will be handled by onAuthStateChanged in App.tsx
      // but we can call onLogin here if we want immediate feedback
      onLogin(result.user);
    } catch (err: any) {
      console.error('Google login failed', err);
      setError(err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#141414] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl p-10 shadow-2xl">
          <div className="flex flex-col items-center mb-10">
            <div className="w-16 h-16 bg-[#141414] rounded-2xl flex items-center justify-center mb-6">
              <ShoppingCart className="text-white w-8 h-8" />
            </div>
            <h1 className="text-3xl font-bold text-[#141414] tracking-tight">ProcureMind</h1>
            <p className="text-[#141414]/60 mt-2 text-center">AI-Powered Procurement Intelligence</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-xl text-sm font-medium">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-[#141414] text-white py-4 rounded-xl font-bold flex items-center justify-center gap-3 hover:bg-[#141414]/90 transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" referrerPolicy="no-referrer" />
                  Sign in with Google
                </>
              )}
            </button>
          </div>

          <div className="mt-10 pt-8 border-t border-[#141414]/5">
            <p className="text-[10px] uppercase tracking-widest font-bold text-[#141414]/40 mb-4 text-center">Enterprise Procurement ERP</p>
            <p className="text-xs text-[#141414]/40 text-center leading-relaxed">
              Securely manage vendors, RFQs, and purchase orders with AI-driven insights.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
