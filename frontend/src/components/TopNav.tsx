import { Settings, Brain } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import UserMenu from './UserMenu';

export default function TopNav() {
  const navigate = useNavigate();

  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/70 backdrop-blur-xl flex justify-between items-center px-8 h-16 border-b border-outline-variant/10">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
          <Brain size={18} className="text-white" />
        </div>
        <span className="text-lg font-bold text-primary font-headline tracking-tight">
          NeuralPeace AI
        </span>
      </div>

      <div className="hidden md:flex items-center gap-8 font-headline tracking-tight">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `pb-1 transition-colors duration-200 px-3 py-1 rounded-lg ${
              isActive
                ? 'text-primary border-b-2 border-primary font-bold'
                : 'text-on-surface-variant font-medium hover:text-primary hover:bg-surface-container-low'
            }`
          }
        >
          Knowledge Base
        </NavLink>
        <NavLink
          to="/chat"
          className={({ isActive }) =>
            `pb-1 transition-colors duration-200 px-3 py-1 rounded-lg ${
              isActive
                ? 'text-primary border-b-2 border-primary font-bold'
                : 'text-on-surface-variant font-medium hover:text-primary hover:bg-surface-container-low'
            }`
          }
        >
          Chat
        </NavLink>
      </div>

      <div className="flex items-center gap-3">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/settings')}
          className="text-on-surface-variant p-2 hover:bg-surface-container-low rounded-full transition-colors"
        >
          <Settings size={20} />
        </motion.button>
        <UserMenu onSignIn={() => navigate('/auth')} />
      </div>
    </nav>
  );
}
