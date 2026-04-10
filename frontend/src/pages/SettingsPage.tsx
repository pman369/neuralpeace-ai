import { useState, useEffect, FormEvent } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Save, Loader2, User, Mail, BookOpen, LogOut, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/AuthContext';
import { updateProfile, updateExpertiseLevel } from '../lib/auth';
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
                <label htmlFor="displayName" className="block text-sm font-medium text-on-surface mb-1.5">
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
                <label className="block text-sm font-medium text-on-surface mb-1.5">
                  Email
                </label>
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
                        <span className="material-symbols-outlined text-[16px]">
                          {item.icon}
                        </span>
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

          {/* Account Section */}
          <section className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 p-6 mb-6">
            <h2 className="text-lg font-bold text-on-surface font-headline mb-4 flex items-center gap-2">
              <BookOpen size={18} className="text-primary" />
              Account
            </h2>

            <div className="space-y-3">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center gap-3 px-4 py-3 bg-surface-container-high rounded-xl text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface transition-all text-sm font-medium"
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
