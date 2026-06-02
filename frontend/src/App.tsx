/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { ThemeProvider } from './lib/ThemeContext';
import TopNav from './components/TopNav';
import ErrorBoundary from './components/ErrorBoundary';
import { envValidation } from './lib/env';
import { AlertTriangle, Server, Key, RefreshCw } from 'lucide-react';

// Lazy load pages for code splitting
const ModuleLibrary = lazy(() => import('./pages/ModuleLibrary'));
const ModuleDetail = lazy(() => import('./pages/ModuleDetail'));
const ChatPage = lazy(() => import('./pages/ChatPage'));
const OnboardingPage = lazy(() => import('./pages/OnboardingPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));
const DebateLobby = lazy(() => import('./pages/DebateLobby'));
const DebateRoom = lazy(() => import('./pages/DebateRoom'));

/**
 * Route guard: redirects to /auth if user is not authenticated.
 */
function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center pt-16">
        <div className="text-on-surface-variant">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}

function AppRoutes() {
  return (
    <Suspense
      fallback={
        <div className="flex-1 flex items-center justify-center pt-16">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <Routes>
        {/* Public: Onboarding / Auth */}
        <Route
          path="/auth"
          element={<OnboardingPage onBack={() => (window.location.href = '/')} />}
        />

        {/* Public: Module Library (browse without auth) */}
        <Route
          path="/"
          element={
            <>
              <TopNav />
              <ModuleLibrary />
            </>
          }
        />

        {/* Public: Module Detail */}
        <Route
          path="/module/:id"
          element={
            <>
              <TopNav />
              <ModuleDetail />
            </>
          }
        />

        {/* Protected: Chat */}
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <TopNav />
              <ChatPage />
            </ProtectedRoute>
          }
        />

        {/* Protected: Settings */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Protected: Debate Arena */}
        <Route
          path="/debate"
          element={
            <ProtectedRoute>
              <TopNav />
              <DebateLobby />
            </ProtectedRoute>
          }
        />
        <Route
          path="/debate/:id"
          element={
            <ProtectedRoute>
              <TopNav />
              <DebateRoom />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function EnvErrorScreen({ errorDetails }: { errorDetails: any }) {
  const missingVars: { name: string; type: string; desc: string }[] = [];
  if (errorDetails.VITE_SUPABASE_URL) {
    missingVars.push({
      name: 'VITE_SUPABASE_URL',
      type: 'Database/Auth URL',
      desc: errorDetails.VITE_SUPABASE_URL._errors[0],
    });
  }
  if (errorDetails.VITE_SUPABASE_ANON_KEY) {
    missingVars.push({
      name: 'VITE_SUPABASE_ANON_KEY',
      type: 'Public Anonymous Key',
      desc: errorDetails.VITE_SUPABASE_ANON_KEY._errors[0],
    });
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-6 relative overflow-hidden font-sans">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] pointer-events-none" />

      <div className="w-full max-w-xl bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 shadow-2xl relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-2xl">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Environment Setup Required
            </h1>
            <p className="text-slate-400 text-sm">
              Please configure your local environment settings to run the application.
            </p>
          </div>
        </div>

        <div className="space-y-4 mb-8">
          {missingVars.map((v) => (
            <div
              key={v.name}
              className="flex gap-4 p-4 bg-slate-950/40 border border-slate-800/80 rounded-2xl hover:border-slate-800 transition-colors animate-pulse"
            >
              <div className="p-2.5 bg-slate-900 border border-slate-800 text-indigo-400 rounded-xl self-start">
                {v.name.includes('URL') ? <Server className="w-5 h-5" /> : <Key className="w-5 h-5" />}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold text-slate-200 font-mono text-sm break-all">
                    {v.name}
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-400 rounded-full font-medium shrink-0 uppercase tracking-wider">
                    {v.type}
                  </span>
                </div>
                <p className="text-xs text-rose-400 mt-1">{v.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 mb-8">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Quick Setup Guide
          </h3>
          <ol className="text-xs text-slate-300 space-y-3 list-decimal list-inside">
            <li>
              Create a{' '}
              <code className="px-1.5 py-0.5 bg-slate-900 text-indigo-300 rounded font-mono font-medium">
                .env.local
              </code>{' '}
              file in your{' '}
              <code className="px-1.5 py-0.5 bg-slate-900 text-slate-300 rounded font-mono font-medium">
                frontend/
              </code>{' '}
              directory.
            </li>
            <li>
              Add the missing keys as shown below:
              <pre className="mt-2 p-3 bg-slate-900 border border-slate-850 rounded-xl overflow-x-auto text-[11px] font-mono text-indigo-400 select-all leading-relaxed">
                {`VITE_SUPABASE_URL=YOUR_SUPABASE_PROJECT_URL\nVITE_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY`}
              </pre>
            </li>
            <li>Restart your development server or refresh the browser.</li>
          </ol>
        </div>

        <button
          onClick={() => window.location.reload()}
          className="w-full flex items-center justify-center gap-2 px-5 py-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 active:scale-[0.98] transition-all text-white font-medium rounded-2xl shadow-lg shadow-indigo-500/20 cursor-pointer"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh Application</span>
        </button>
      </div>
    </div>
  );
}

export default function App() {
  if (!envValidation.success) {
    const errorDetails = envValidation.error.format();
    return <EnvErrorScreen errorDetails={errorDetails} />;
  }

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ThemeProvider>
          <AuthProvider>
            <div className="bg-surface text-on-surface min-h-screen flex flex-col">
              <AppRoutes />
            </div>
          </AuthProvider>
        </ThemeProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

