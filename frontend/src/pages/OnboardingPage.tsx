import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Brain, Mail, Loader2, ArrowLeft, Sparkles, ChevronRight, CheckCircle2, Lock, Key, UserPlus, LogIn } from 'lucide-react';
import { sendMagicLink, signUpWithPassword, signInWithPassword } from '../lib/auth';
import { supabase } from '../lib/supabase';
import { ExpertiseLevel } from '../types';

interface OnboardingPageProps {
  onBack: () => void;
}

interface Question {
  id: string;
  question_text: string;
  options: { text: string; level: ExpertiseLevel }[];
  category: string;
}

type Step = 'welcome' | 'quiz' | 'result' | 'email' | 'sent';

export default function OnboardingPage({ onBack }: OnboardingPageProps) {
  const [step, setStep] = useState<Step>('welcome');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authMethod, setAuthMethod] = useState<'magic' | 'password'>('magic');
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('signup');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [answers, setAnswers] = useState<ExpertiseLevel[]>([]);
  const [finalLevel, setFinalLevel] = useState<ExpertiseLevel>('Practitioner');

  useEffect(() => {
    async function fetchQuestions() {
      const { data } = await supabase.from('onboarding_questions').select('*');
      if (data) setQuestions(data);
    }
    fetchQuestions();
  }, []);

  const handleStartQuiz = () => setStep('quiz');

  const handleAnswer = (level: ExpertiseLevel) => {
    const newAnswers = [...answers, level];
    setAnswers(newAnswers);

    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx(currentQuestionIdx + 1);
    } else {
      // Calculate final level
      const counts: Record<string, number> = { Novice: 0, Practitioner: 0, Expert: 0, Scholar: 0 };
      newAnswers.forEach(a => counts[a]++);
      
      let maxLevel: ExpertiseLevel = 'Novice';
      let maxCount = -1;
      const levels: ExpertiseLevel[] = ['Novice', 'Practitioner', 'Expert', 'Scholar'];
      
      levels.forEach(l => {
        if (counts[l] >= maxCount) {
          maxCount = counts[l];
          maxLevel = l;
        }
      });
      
      setFinalLevel(maxLevel);
      setStep('result');
    }
  };

  const handleAuthSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setSending(true);
    setError(null);

    let result;
    if (authMethod === 'magic') {
      result = await sendMagicLink(email.trim(), finalLevel);
      if (!result.error) setStep('sent');
    } else {
      if (authMode === 'signup') {
        if (password.length < 6) {
          setError('Password must be at least 6 characters');
          setSending(false);
          return;
        }
        result = await signUpWithPassword(email.trim(), password, finalLevel);
      } else {
        result = await signInWithPassword(email.trim(), password);
      }
    }

    if (result?.error) {
      setError(result.error);
    }
    setSending(false);
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-6 py-12">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl" />
      </div>

      <div className="max-w-md w-full relative">
        {/* Back button */}
        {step !== 'sent' && (
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors mb-8 font-medium"
          >
            <ArrowLeft size={16} />
            Back to Library
          </button>
        )}

        <AnimatePresence mode="wait">
          {/* STEP: WELCOME */}
          {step === 'welcome' && (
            <motion.div
              key="welcome"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 p-8 shadow-sm"
            >
              <div className="flex items-center gap-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-xl flex items-center justify-center">
                  <Brain size={24} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-on-surface font-headline">NeuralPeace AI</h2>
              </div>
              <h1 className="text-2xl font-extrabold text-on-surface font-headline mb-4">
                Personalized Learning
              </h1>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-8">
                Welcome to the expert-level neuroscience assistant. To provide the best experience, we need to assess your current expertise level.
              </p>
              <div className="space-y-3">
                <button
                  onClick={handleStartQuiz}
                  className="w-full bg-primary text-on-primary font-semibold py-3 rounded-xl hover:bg-primary-container transition-all flex items-center justify-center gap-2"
                >
                  Start Assessment <ChevronRight size={18} />
                </button>
                <button
                  onClick={() => {
                    setFinalLevel('Expert');
                    setStep('email');
                  }}
                  className="w-full text-on-surface-variant hover:text-primary font-medium py-2 transition-colors text-sm"
                >
                  I already know my level
                </button>
              </div>
            </motion.div>
          )}

          {/* STEP: QUIZ */}
          {step === 'quiz' && questions.length > 0 && (
            <motion.div
              key="quiz"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 p-8 shadow-sm"
            >
              <div className="flex justify-between items-center mb-6">
                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">
                  Question {currentQuestionIdx + 1} of {questions.length}
                </span>
                <span className="text-[10px] font-bold text-on-surface-variant uppercase bg-surface-container-high px-2 py-1 rounded">
                  {questions[currentQuestionIdx].category}
                </span>
              </div>
              <h2 className="text-xl font-bold text-on-surface font-headline mb-8 leading-tight">
                {questions[currentQuestionIdx].question_text}
              </h2>
              <div className="space-y-3">
                {questions[currentQuestionIdx].options.map((opt, i) => (
                  <button
                    key={i}
                    onClick={() => handleAnswer(opt.level)}
                    className="w-full text-left p-4 bg-surface-container-low border border-outline-variant/10 rounded-xl text-sm text-on-surface-variant hover:border-primary/40 hover:bg-surface-container-high transition-all"
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* STEP: RESULT */}
          {step === 'result' && (
            <motion.div
              key="result"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 p-8 shadow-sm text-center"
            >
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={32} className="text-green-500" />
              </div>
              <p className="text-xs font-bold text-on-surface-variant uppercase tracking-widest mb-2">
                Assessment Complete
              </p>
              <h2 className="text-2xl font-extrabold text-on-surface font-headline mb-4">
                Level: <span className="text-primary">{finalLevel}</span>
              </h2>
              <p className="text-on-surface-variant text-sm leading-relaxed mb-8">
                Based on your responses, we've calibrated your AI assistant to provide information at the **{finalLevel}** level.
              </p>
              <button
                onClick={() => setStep('email')}
                className="w-full bg-primary text-on-primary font-semibold py-3 rounded-xl hover:bg-primary-container transition-all"
              >
                Create Account
              </button>
            </motion.div>
          )}

          {/* STEP: EMAIL / AUTH */}
          {step === 'email' && (
            <motion.div
              key="email"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 p-8 shadow-sm"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-extrabold text-on-surface font-headline mb-2">
                  {authMethod === 'magic' ? 'Almost there' : authMode === 'signup' ? 'Create Account' : 'Welcome Back'}
                </h2>
                <p className="text-on-surface-variant text-sm leading-relaxed">
                  {authMethod === 'magic' 
                    ? `Sign in with a magic link. We'll save your ${finalLevel} expertise level.`
                    : authMode === 'signup' 
                      ? `Secure your profile with a password. Your ${finalLevel} level will be saved.`
                      : 'Enter your credentials to continue your research.'}
                </p>
              </div>

              {/* Auth Method Toggle */}
              <div className="flex p-1 bg-surface-container-low rounded-xl mb-6">
                <button
                  onClick={() => {
                    setAuthMethod('magic');
                    setError(null);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                    authMethod === 'magic' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <Sparkles size={14} /> Magic Link
                </button>
                <button
                  onClick={() => {
                    setAuthMethod('password');
                    setError(null);
                  }}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-bold rounded-lg transition-all ${
                    authMethod === 'password' ? 'bg-surface-container-lowest text-primary shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                >
                  <Lock size={14} /> Password
                </button>
              </div>

              <form onSubmit={handleAuthSubmit}>
                <div className="space-y-4 mb-6">
                  <div>
                    <label htmlFor="email" className="block text-[10px] font-bold text-outline uppercase tracking-widest mb-1.5 ml-1">
                      Email Address
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
                        className="block w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant/20 rounded-xl text-on-surface outline-none transition-all text-sm focus:ring-2 focus:ring-primary/20"
                      />
                    </div>
                  </div>

                  {authMethod === 'password' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="space-y-4"
                    >
                      <div>
                        <label htmlFor="password" className="block text-[10px] font-bold text-outline uppercase tracking-widest mb-1.5 ml-1">
                          Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                            <Key size={16} className="text-outline" />
                          </div>
                          <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            className="block w-full pl-10 pr-4 py-3 bg-surface-container-low border border-outline-variant/20 rounded-xl text-on-surface outline-none transition-all text-sm focus:ring-2 focus:ring-primary/20"
                          />
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {error && (
                  <motion.div 
                    initial={{ opacity: 0 }} 
                    animate={{ opacity: 1 }}
                    className="mb-4 text-red-500 text-[10px] font-bold uppercase bg-red-500/5 px-3 py-2 rounded-lg border border-red-500/10"
                  >
                    {error}
                  </motion.div>
                )}

                <button
                  type="submit"
                  disabled={sending}
                  className="w-full bg-primary text-on-primary font-bold py-3.5 rounded-xl hover:bg-primary-container transition-all flex items-center justify-center gap-2 shadow-lg shadow-primary/10"
                >
                  {sending ? (
                    <Loader2 size={18} className="animate-spin" />
                  ) : authMethod === 'magic' ? (
                    <><Sparkles size={18} /> Send Magic Link</>
                  ) : authMode === 'signup' ? (
                    <><UserPlus size={18} /> Create Account</>
                  ) : (
                    <><LogIn size={18} /> Sign In</>
                  )}
                </button>

                {authMethod === 'password' && (
                  <div className="mt-4 text-center">
                    <button
                      type="button"
                      onClick={() => setAuthMode(authMode === 'signup' ? 'login' : 'signup')}
                      className="text-[11px] font-bold text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                    >
                      {authMode === 'signup' ? 'ALREADY HAVE AN ACCOUNT? SIGN IN' : 'NEED AN ACCOUNT? SIGN UP'}
                    </button>
                  </div>
                )}
              </form>
            </motion.div>
          )}

          {/* STEP: SENT */}
          {step === 'sent' && (
            <motion.div
              key="sent"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="bg-surface-container-lowest rounded-2xl border border-outline-variant/15 p-8 shadow-sm text-center"
            >
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Mail size={32} className="text-primary" />
              </div>
              <h2 className="text-2xl font-extrabold text-on-surface font-headline mb-2">
                Check your email
              </h2>
              <p className="text-on-surface-variant text-sm mb-6">
                We've sent a magic link to <br/><span className="text-on-surface font-bold">{email}</span>
              </p>
              <button
                onClick={() => setStep('email')}
                className="text-primary font-medium hover:underline text-sm"
              >
                Use a different email
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
