/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/AuthContext';
import { ThemeProvider } from './lib/ThemeContext';
import TopNav from './components/TopNav';
import ModuleLibrary from './pages/ModuleLibrary';
import ModuleDetail from './pages/ModuleDetail';
import ChatPage from './pages/ChatPage';
import OnboardingPage from './pages/OnboardingPage';
import SettingsPage from './pages/SettingsPage';

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
    <Routes>
      {/* Public: Onboarding / Auth */}
      <Route path="/auth" element={<OnboardingPage onBack={() => (window.location.href = '/')} />} />

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

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <div className="bg-surface text-on-surface min-h-screen flex flex-col">
            <AppRoutes />
          </div>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
