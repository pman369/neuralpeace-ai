import { useState, useEffect, FormEvent } from 'react';
import { motion } from 'motion/react';
import {
  ArrowLeft,
  Save,
  Loader2,
  User,
  Mail,
  LogOut,
  Trash2,
  Shield,
  ShieldCheck,
  Trophy,
  Star,
  Award,
  Sparkles,
  Flame,
  Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { updateProfile, resetPassword } from '../lib/auth';
import { EXPERTISE_LEVELS } from '../constants';
import { ExpertiseLevel } from '../types';

export default function SettingsPage() {
  const navigate = useNavigate();
  const { user, profile, signOut, refreshProfile } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [expertiseLevel, setExpertiseLevel] = useState<ExpertiseLevel>('Expert');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resetSent, setResetSent] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? '');
      setExpertiseLevel((profile.expertise_level as ExpertiseLevel) ?? 'Expert');
    }
  }, [profile]);

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);
    setError(null);
    setSaved(false);

    const { error: profileError } = await updateProfile(user.id, {
      display_name: displayName.trim() || undefined,
      expertise_level: expertiseLevel,
    });

    if (profileError) {
      setError(profileError);
    } else {
      setSaved(true);
      await refreshProfile();
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const handlePasswordReset = async () => {
    if (!user?.email) return;
    setResetLoading(true);
    const { error: resetError } = await resetPassword(user.email);
    if (resetError) {
      setError(resetError);
    } else {
      setResetSent(true);
      setTimeout(() => setResetSent(false), 5000);
    }
    setResetLoading(false);
  };

  if (!user) {
    navigate('/auth');
    return null;
  }

  return (
    <div className="bg-surface min-h-screen">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 w-full z-50 bg-surface/70 backdrop-blur-xl border-b border-outline-variant/10">
        <div className="max-w-2xl mx-auto px-6 h-16 flex items-center gap-4">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors font-medium"
          >
            <ArrowLeft size={18} />
            Back
          </motion.button>
          <h1 className="text-lg font-bold text-on-surface font-headline">Settings</h1>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-6 pt-24 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* Profile Section */}
          <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 p-6 mb-6">
            <h2 className="text-lg font-bold text-on-surface font-headline mb-4 flex items-center gap-2">
              <User size={18} className="text-primary" />
              Profile
            </h2>

            <form onSubmit={handleSave}>
              {/* Display Name */}
              <div className="mb-4">
                <label
                  htmlFor="displayName"
                  className="block text-sm font-medium text-on-surface mb-1.5"
                >
                  Display name
                </label>
                <input
                  id="displayName"
                  type="text"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Your name"
                  maxLength={50}
                  className="block w-full px-4 py-3 bg-surface-container-low border border-outline-variant/20 rounded-xl text-on-surface placeholder:text-outline/50 focus:ring-2 focus:ring-primary/20 focus:border-primary/40 outline-none transition-all text-sm"
                />
              </div>

              {/* Email (read-only) */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-on-surface mb-1.5">Email</label>
                <div className="flex items-center gap-2 px-4 py-3 bg-surface-container-high rounded-xl text-on-surface-variant text-sm">
                  <Mail size={14} className="text-outline flex-shrink-0" />
                  {profile?.email ?? user.email}
                </div>
              </div>

              {/* Expertise Level */}
              <div className="mb-6">
                <label className="block text-sm font-medium text-on-surface mb-1.5">
                  Default expertise level
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {EXPERTISE_LEVELS.map((item) => {
                    const isActive = item.level === expertiseLevel;
                    return (
                      <button
                        key={item.level}
                        type="button"
                        onClick={() => setExpertiseLevel(item.level)}
                        className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-primary text-on-primary shadow-sm'
                            : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">{item.icon}</span>
                        {item.level}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Error / Success */}
              {error && (
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  {error}
                </div>
              )}
              {saved && (
                <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-700 text-sm">
                  Settings saved successfully!
                </div>
              )}

              {/* Save Button */}
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-primary text-on-primary font-semibold py-3 rounded-xl hover:bg-primary-container transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save size={16} />
                    Save changes
                  </>
                )}
              </button>
            </form>
          </section>

          {/* Trophy Room Section */}
          <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 p-6 mb-6 overflow-hidden relative">
            {/* Decorative sparkle background */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              <div className="absolute -top-8 -right-8 w-32 h-32 bg-amber-400/5 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-primary/5 rounded-full blur-xl" />
            </div>

            <div className="relative">
              <h2 className="text-lg font-bold text-on-surface font-headline mb-5 flex items-center gap-2">
                <Trophy size={18} className="text-amber-500" />
                Trophy Room
              </h2>

              {/* Reputation Score */}
              <div className="flex items-center gap-5 mb-6 p-4 bg-gradient-to-r from-amber-500/5 via-surface-container-low to-primary/5 rounded-xl border border-outline-variant/10">
                <div className="relative w-16 h-16 flex-shrink-0">
                  <svg className="w-16 h-16 -rotate-90" viewBox="0 0 64 64">
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="text-outline-variant/10"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="url(#repGradient)"
                      strokeWidth="4"
                      strokeLinecap="round"
                      strokeDasharray={`${Math.min(((profile?.reputation_score ?? 0) / 100) * 175.9, 175.9)} 175.9`}
                    />
                    <defs>
                      <linearGradient id="repGradient" x1="0" y1="0" x2="1" y2="1">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="100%" stopColor="#8b5cf6" />
                      </linearGradient>
                    </defs>
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Flame size={20} className="text-amber-500" />
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-black text-on-surface tracking-tight">
                    {profile?.reputation_score ?? 0}
                  </div>
                  <div className="text-xs text-on-surface-variant font-medium">
                    Reputation Points
                  </div>
                </div>
              </div>

              {/* Badges */}
              <div>
                <h3 className="text-sm font-bold text-on-surface mb-3 flex items-center gap-1.5">
                  <Award size={14} className="text-primary" />
                  Earned Badges
                </h3>
                {(() => {
                  const badges: string[] = profile?.badges ?? [];
                  if (badges.length === 0) {
                    return (
                      <div className="text-center py-8 px-4">
                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-outline-variant/5 mb-3">
                          <Sparkles size={20} className="text-outline" />
                        </div>
                        <p className="text-sm text-on-surface-variant font-medium">No badges yet</p>
                        <p className="text-xs text-outline mt-1">
                          End your first debate to earn reputation and badges!
                        </p>
                      </div>
                    );
                  }
                  return (
                    <div className="grid grid-cols-2 gap-3">
                      {badges.map((badge, i) => {
                        const config: Record<
                          string,
                          { icon: typeof Star; color: string; bg: string }
                        > = {
                          'Source Master': {
                            icon: ShieldCheck,
                            color: 'text-emerald-500',
                            bg: 'bg-emerald-500/10 border-emerald-500/20',
                          },
                          Debater: {
                            icon: Zap,
                            color: 'text-violet-500',
                            bg: 'bg-violet-500/10 border-violet-500/20',
                          },
                        };
                        const c = config[badge] ?? {
                          icon: Star,
                          color: 'text-amber-500',
                          bg: 'bg-amber-500/10 border-amber-500/20',
                        };
                        const Icon = c.icon;
                        return (
                          <motion.div
                            key={badge + i}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: i * 0.08 }}
                            className={`flex items-center gap-3 p-3 rounded-xl border ${c.bg}`}
                          >
                            <Icon size={18} className={c.color} />
                            <span className="text-sm font-bold text-on-surface">{badge}</span>
                          </motion.div>
                        );
                      })}
                    </div>
                  );
                })()}
              </div>
            </div>
          </section>

          {/* Account & Security Section */}
          <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 p-6 mb-6">
            <h2 className="text-lg font-bold text-on-surface font-headline mb-4 flex items-center gap-2">
              <Shield size={18} className="text-primary" />
              Security
            </h2>

            <div className="space-y-4">
              <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-on-surface">Password</h3>
                    <p className="text-xs text-on-surface-variant">
                      Update your security credentials
                    </p>
                  </div>
                  <button
                    onClick={handlePasswordReset}
                    disabled={resetLoading || resetSent}
                    className="flex items-center gap-2 px-4 py-2 bg-surface-container-lowest border border-outline-variant/20 rounded-lg text-xs font-bold text-primary hover:bg-primary/5 transition-all"
                  >
                    {resetLoading ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : resetSent ? (
                      'Email Sent!'
                    ) : (
                      'Reset Password'
                    )}
                  </button>
                </div>
              </div>

              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 bg-red-500/5 text-red-600 hover:bg-red-500/10 rounded-xl transition-all text-sm font-bold border border-red-500/10"
              >
                <LogOut size={16} />
                Sign out
              </button>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="bg-surface-container-lowest rounded-2xl border border-red-200/30 p-6">
            <h2 className="text-lg font-bold text-red-700 font-headline mb-2 flex items-center gap-2">
              <Trash2 size={18} />
              Danger zone
            </h2>
            <p className="text-sm text-on-surface-variant mb-4">
              Once you delete your account, there is no going back. Please be certain.
            </p>
            <button
              disabled
              className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-red-200 rounded-xl text-red-600 text-sm font-medium opacity-50 cursor-not-allowed"
            >
              <Trash2 size={16} />
              Delete account (coming soon)
            </button>
          </section>
        </motion.div>
      </main>
    </div>
  );
}
