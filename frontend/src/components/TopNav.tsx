import { useState } from 'react';
import { Settings, Brain, Palette, Menu, X, Library, MessageSquare, MessagesSquare } from 'lucide-react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import UserMenu from './UserMenu';
import ThemeSettings from './ThemeSettings';

export default function TopNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const [themeOpen, setThemeOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks = [
    { to: '/', label: 'Knowledge Base', icon: <Library size={18} /> },
    { to: '/chat', label: 'Chat', icon: <MessageSquare size={18} /> },
    { to: '/debate', label: 'Mind Meld', icon: <MessagesSquare size={18} /> },
  ];

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-surface/70 backdrop-blur-xl flex justify-between items-center px-4 md:px-8 h-16 border-b border-outline-variant/10">
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setMobileMenuOpen(true)}
            className="md:hidden p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full transition-colors"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
              <Brain size={18} className="text-white" />
            </div>
            <span className="text-lg font-bold text-primary font-headline tracking-tight hidden sm:inline">
              NeuralPeace AI
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 font-headline tracking-tight">
          {navLinks.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `pb-1 transition-colors duration-200 px-3 py-1 rounded-lg ${
                  isActive
                    ? 'text-primary border-b-2 border-primary font-bold'
                    : 'text-on-surface-variant font-medium hover:text-primary hover:bg-surface-container-low'     
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-1 md:gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setThemeOpen(true)}
            className="text-on-surface-variant p-2 hover:bg-surface-container-low rounded-full transition-colors"
            title="Appearance"
          >
            <Palette size={20} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/settings')}
            className="text-on-surface-variant p-2 hover:bg-surface-container-low rounded-full transition-colors"
            title="Settings"
          >
            <Settings size={20} />
          </motion.button>
          <UserMenu onSignIn={() => navigate('/auth')} />
        </div>
      </nav>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] md:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 h-full w-[280px] bg-surface z-[70] md:hidden shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-outline-variant/10 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                    <Brain size={18} className="text-white" />
                  </div>
                  <span className="font-bold text-primary font-headline">NeuralPeace</span>
                </div>
                <button 
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-2 text-on-surface-variant hover:bg-surface-container-low rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 p-4 flex flex-col gap-2">
                {navLinks.map(link => {
                  const isActive = location.pathname === link.to;
                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${
                        isActive 
                          ? 'bg-primary/10 text-primary font-bold' 
                          : 'text-on-surface-variant hover:bg-surface-container-low'
                      }`}
                    >
                      {link.icon}
                      <span>{link.label}</span>
                    </NavLink>
                  );
                })}
              </div>

              <div className="p-6 border-t border-outline-variant/10 text-center">
                <p className="text-xs text-on-surface-variant">NeuralPeace AI v0.1.0</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {themeOpen && <ThemeSettings onClose={() => setThemeOpen(false)} />}
      </AnimatePresence>
    </>
  );
}

