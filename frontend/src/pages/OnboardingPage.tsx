import { useState, FormEvent } from 'react';
import { motion } from 'motion/react';
import { Brain, Mail, Loader2, ArrowLeft, Sparkles } from 'lucide-react';
import { sendMagicLink } from '../lib/auth';

interface OnboardingPageProps {
  onBack: () => void;
}

export default function OnboardingPage({ onBack }: OnboardingPageProps) {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSending(true);
    setError(null);

    const { error: err } = await sendMagicLink(email.trim());
    if (err) {
      setError(err);
    } else {
      setSent(true);
    }
    setSending(false);
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full text-center"
        >
          <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Mail size={36} className="text-primary" />
          </div>
          <h1 className="text-3xl font-extrabold text-on-surface font-headline mb-3">
            Check your inbox
          </h1>
          <p className="text-on-surface-variant leading-relaxed mb-2">
            We've sent a magic link to
          </p>
          <p className="text-primary font-semibold text-lg mb-6">{email}</p>
          <p className="text-on-surface-variant text-sm leading-relaxed mb-8">
            Click the link to sign in. The link will expire in 1 hour.
            Check your spam folder if you don't see it.
          </p>
          <button
            onClick={() => {
              setSent(false);
              setEmail('');
            }}
            className="text-primary font-medium hover:underline text-sm"
          >
            Use a different email
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-md w-full relative"
      >
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-8 font-medium"
        >
          <ArrowLeft size={16} />
          Back to Library
        </button>

        {/* Card */}
        <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 p-8 shadow-sm">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
              <Brain size={24} className="text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-on-surface font-headline">NeuralPeace AI</h2>
              <p className="text-xs text-on-surface-variant">Sign in to continue</p>
            </div>
          </div>

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-2xl font-extrabold text-on-surface font-headline mb-2">
              Welcome back
            </h1>
            <p className="text-on-surface-variant text-sm leading-relaxed">
              Sign in with a magic link — no password needed. We'll send you a link to your email.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label htmlFor="email" className="block text-sm font-medium text-on-surface mb-1.5">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail size={16} className="text-outline" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  className="block w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant/20 rounded-xl text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all text-sm"
                />
              </div>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={sending || !email.trim()}
              className="w-full bg-primary text-on-primary font-semibold py-3 rounded-xl hover:bg-primary-container transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {sending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Sending magic link...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Send magic link
                </>
              )}
            </button>
          </form>

          {/* Features */}
          <div className="mt-8 pt-6 border-t border-outline-variant/15">
            <p className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
              What you'll get
            </p>
            <ul className="space-y-2 text-sm text-on-surface-variant">
              <li className="flex items-center gap-2">
                <Sparkles size={14} className="text-primary flex-shrink-0" />
                AI-powered neuroscience Q&A
              </li>
              <li className="flex items-center gap-2">
                <Sparkles size={14} className="text-primary flex-shrink-0" />
                Personalized learning at your expertise level
              </li>
              <li className="flex items-center gap-2">
                <Sparkles size={14} className="text-primary flex-shrink-0" />
                Saved conversation history
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
