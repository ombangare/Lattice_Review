import React, { useState } from 'react';
import { auth } from '../firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from 'firebase/auth';
import { ShieldCheck, Mail, Lock, User, Sparkles, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';

interface AuthViewProps {
  onAuthSuccess: () => void;
  onBackToLanding?: () => void;
}

export function AuthView({ onAuthSuccess, onBackToLanding }: AuthViewProps) {
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleForgotPassword = async () => {
    if (!email) {
      setError("Please enter your email address in the email field above to receive a password reset link.");
      setSuccessMessage(null);
      return;
    }
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccessMessage("Password reset email sent! Please check your inbox and follow the instructions to reset your password.");
    } catch (err: any) {
      console.error("Reset error:", err);
      let errMsg = "Failed to send reset email. Please try again.";
      if (err.code === 'auth/invalid-email') {
        errMsg = "Please enter a valid email address.";
      } else if (err.code === 'auth/user-not-found') {
        errMsg = "No account found with this email address.";
      } else if (err.code === 'auth/too-many-requests') {
        errMsg = "Too many password reset requests. Please wait and try again later.";
      }
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoMode = () => {
    localStorage.setItem("ccr_demo_mode", "true");
    onAuthSuccess();
    window.location.reload();
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);
    setIsLoading(true);

    if (isSignUp) {
      if (!displayName.trim()) {
        setError("Name is required");
        setIsLoading(false);
        return;
      }
      if (password !== confirmPassword) {
        setError("Passwords do not match");
        setIsLoading(false);
        return;
      }
      if (password.length < 6) {
        setError("Password must be at least 6 characters long");
        setIsLoading(false);
        return;
      }
    }

    try {
      if (isSignUp) {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        await updateProfile(userCredential.user, {
          displayName: displayName
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      onAuthSuccess();
    } catch (err: any) {
      console.error("Auth error:", err);
      let errMsg = "An unexpected error occurred. Please try again.";
      if (err.code === 'auth/email-already-in-use') {
        errMsg = "This email is already registered. If you forgot your password, you can reset it below or switch to the Sign In tab.";
      } else if (err.code === 'auth/invalid-email') {
        errMsg = "Please enter a valid email address.";
      } else if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        errMsg = "Invalid email or password combination.";
      } else if (err.code === 'auth/weak-password') {
        errMsg = "Password is too weak. Please use at least 6 characters.";
      } else if (err.code === 'auth/operation-not-allowed') {
        errMsg = "Email/Password sign-in is disabled in your Firebase Console. Please go to your Firebase Console under 'Authentication > Sign-in method' and enable 'Email/Password' to register. In the meantime, you can use 'Demo Developer Session' below to bypass login and explore the app immediately!";
      }
      setError(errMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-brand-cream p-4 font-sans relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-40" />

      <div className="w-full max-w-md relative z-10">
        {/* Back link */}
        {onBackToLanding && (
          <button
            onClick={onBackToLanding}
            className="mb-6 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
          >
            &larr; Back to Lattice Review
          </button>
        )}

        {/* App Logo & Heading */}
        <div className="text-center mb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-primary text-white shadow-lg shadow-brand-primary/10 mb-4">
            <ShieldCheck className="h-7 w-7 text-brand-secondary" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Lattice Review
          </h1>
          <p className="mt-2 text-xs font-medium text-slate-500">
            Keep your codebase's architectural standards in perfect harmony
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xl p-8">
          {/* Tabs */}
          <div className="flex border-b border-slate-100 mb-6">
            <button
              onClick={() => { 
                setIsSignUp(false); 
                setError(null); 
                setSuccessMessage(null);
                setShowPassword(false);
                setShowConfirmPassword(false);
              }}
              className={`flex-1 pb-3 text-sm font-semibold border-b-2 text-center transition-colors ${
                !isSignUp 
                  ? 'border-brand-secondary text-brand-secondary' 
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { 
                setIsSignUp(true); 
                setError(null); 
                setSuccessMessage(null);
                setShowPassword(false);
                setShowConfirmPassword(false);
              }}
              className={`flex-1 pb-3 text-sm font-semibold border-b-2 text-center transition-colors ${
                isSignUp 
                  ? 'border-brand-secondary text-brand-secondary' 
                  : 'border-transparent text-slate-400 hover:text-slate-600'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-xs text-red-600 flex items-start space-x-2">
                <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {successMessage && (
              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-xl text-xs text-emerald-700 flex items-start space-x-2">
                <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-emerald-600" />
                <span>{successMessage}</span>
              </div>
            )}

            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <User className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type="text"
                    required
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="Jane Doe"
                    className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:bg-white transition-all text-slate-800 placeholder-slate-400"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Mail className="h-4.5 w-4.5" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@company.com"
                  className="w-full pl-10 pr-4 py-2.5 text-sm bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:bg-white transition-all text-slate-800 placeholder-slate-400"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                  <Lock className="h-4.5 w-4.5" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:bg-white transition-all text-slate-800 placeholder-slate-400"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {!isSignUp && (
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleForgotPassword}
                  className="text-xs font-medium text-brand-secondary hover:text-brand-secondary/80 transition-colors cursor-pointer"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            {isSignUp && (
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                    <Lock className="h-4.5 w-4.5" />
                  </span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-10 py-2.5 text-sm bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-secondary focus:bg-white transition-all text-slate-800 placeholder-slate-400"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    title={showConfirmPassword ? "Hide password" : "Show password"}
                  >
                    {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-brand-primary hover:bg-brand-primary/95 active:bg-brand-primary text-white font-medium rounded-xl text-sm transition-all focus:outline-none focus:ring-2 focus:ring-brand-primary focus:ring-offset-2 flex items-center justify-center space-x-2 shadow-lg shadow-brand-primary/10 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer mt-2"
            >
              {isLoading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                  <Sparkles className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-100"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-2 text-slate-400 font-semibold tracking-wider">Or Fast Track</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDemoMode}
            className="w-full py-2.5 bg-slate-50 hover:bg-slate-100 active:bg-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-all flex items-center justify-center space-x-2 border border-slate-250 cursor-pointer shadow-sm hover:shadow"
          >
            <Sparkles className="h-4 w-4 text-amber-500 animate-pulse" />
            <span>Launch Demo Developer Session (Bypass Auth)</span>
          </button>

          {/* Quick Notice */}
          <p className="mt-6 text-center text-xs text-slate-400 leading-relaxed">
            Authorized access only. Your login session is securely managed by Firebase Authentication & Protected Firestore rules.
          </p>
        </div>
      </div>
    </div>
  );
}
