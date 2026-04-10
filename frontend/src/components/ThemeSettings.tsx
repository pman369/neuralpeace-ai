import { FC, useState } from 'react';
import { motion } from 'motion/react';
import { Sun, Moon, Monitor, Palette, RotateCcw, Check } from 'lucide-react';
import { useTheme, ThemeMode, ThemeColors, DEFAULT_LIGHT_COLORS, DEFAULT_DARK_COLORS } from '../lib/ThemeContext';

interface ThemeSettingsProps {
  onClose: () => void;
}

const ThemeSettings: FC<ThemeSettingsProps> = ({ onClose }) => {
  const { theme, setMode, setColors, resetColors, isDark } = useTheme();
  const [customPrimary, setCustomPrimary] = useState(theme.colors.primary);
  const [customSecondary, setCustomSecondary] = useState(theme.colors.secondary);
  const [customTertiary, setCustomTertiary] = useState(theme.colors.tertiary);

  const modes: { value: ThemeMode; label: string; icon: FC<{ size: number }> }[] = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor },
  ];

  const presets = [
    { name: 'Ocean', colors: { primary: '#0058be', secondary: '#8127cf', tertiary: '#a12e70' } },
    { name: 'Forest', colors: { primary: '#2d7a4f', secondary: '#5b8c3e', tertiary: '#8b6914' } },
    { name: 'Sunset', colors: { primary: '#e85d26', secondary: '#c43e8a', tertiary: '#f5a623' } },
    { name: 'Midnight', colors: { primary: '#6c8cff', secondary: '#a855f7', tertiary: '#ec4899' } },
    { name: 'Teal', colors: { primary: '#0d9488', secondary: '#7c3aed', tertiary: '#db2777' } },
  ];

  const applyPreset = (colors: ThemeColors) => {
    setCustomPrimary(colors.primary);
    setCustomSecondary(colors.secondary);
    setCustomTertiary(colors.tertiary);
    setColors(colors);
  };

  const applyCustom = () => {
    setColors({ primary: customPrimary, secondary: customSecondary, tertiary: customTertiary });
  };

  const isDefault =
    theme.colors.primary === (isDark ? DEFAULT_DARK_COLORS.primary : DEFAULT_LIGHT_COLORS.primary) &&
    theme.colors.secondary === (isDark ? DEFAULT_DARK_COLORS.secondary : DEFAULT_LIGHT_COLORS.secondary) &&
    theme.colors.tertiary === (isDark ? DEFAULT_DARK_COLORS.tertiary : DEFAULT_LIGHT_COLORS.tertiary);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-surface-container-lowest border border-outline-variant/15 rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-outline-variant/10">
          <div className="flex items-center gap-2">
            <Palette size={18} className="text-primary" />
            <h2 className="text-lg font-bold text-on-surface font-headline">Appearance</h2>
          </div>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors text-sm font-medium">
            Done
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Theme Mode */}
          <section>
            <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-3">Mode</h3>
            <div className="grid grid-cols-3 gap-2">
              {modes.map(({ value, label, icon: Icon }) => (
                <button
                  key={value}
                  onClick={() => setMode(value)}
                  className={`flex flex-col items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                    theme.mode === value
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                  }`}
                >
                  <Icon size={20} />
                  {label}
                </button>
              ))}
            </div>
          </section>

          {/* Color Presets */}
          <section>
            <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-3">Color Presets</h3>
            <div className="grid grid-cols-5 gap-2">
              {presets.map((preset) => (
                <button
                  key={preset.name}
                  onClick={() => applyPreset(preset.colors)}
                  className="group flex flex-col items-center gap-1.5 p-2 rounded-xl hover:bg-surface-container-high transition-all"
                  title={preset.name}
                >
                  <div className="flex gap-0.5">
                    <div className="w-5 h-5 rounded-full border border-outline-variant/20" style={{ backgroundColor: preset.colors.primary }} />
                    <div className="w-5 h-5 rounded-full border border-outline-variant/20 -ml-2" style={{ backgroundColor: preset.colors.secondary }} />
                    <div className="w-5 h-5 rounded-full border border-outline-variant/20 -ml-2" style={{ backgroundColor: preset.colors.tertiary }} />
                  </div>
                  <span className="text-[10px] text-on-surface-variant group-hover:text-on-surface">{preset.name}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Custom Colors */}
          <section>
            <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-3">Custom Colors</h3>
            <div className="space-y-3">
              {[
                { label: 'Primary', value: customPrimary, setter: setCustomPrimary },
                { label: 'Secondary', value: customSecondary, setter: setCustomSecondary },
                { label: 'Tertiary', value: customTertiary, setter: setCustomTertiary },
              ].map(({ label, value, setter }) => (
                <div key={label} className="flex items-center gap-3">
                  <label className="text-sm text-on-surface-variant w-20 flex-shrink-0">{label}</label>
                  <div className="relative flex-1">
                    <input
                      type="color"
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      className="w-10 h-8 rounded-md border border-outline-variant/20 cursor-pointer"
                    />
                    <input
                      type="text"
                      value={value}
                      onChange={(e) => setter(e.target.value)}
                      className="ml-2 w-24 px-2 py-1.5 bg-surface-container-low border border-outline-variant/20 rounded-lg text-xs text-on-surface font-mono outline-none focus:ring-1 focus:ring-primary/30"
                    />
                  </div>
                </div>
              ))}
              <button
                onClick={applyCustom}
                className="w-full bg-primary/10 text-primary font-medium py-2 rounded-lg hover:bg-primary/20 transition-colors text-sm flex items-center justify-center gap-1.5"
              >
                <Check size={14} />
                Apply custom colors
              </button>
            </div>
          </section>

          {/* Reset */}
          {!isDefault && (
            <button
              onClick={resetColors}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border border-outline-variant/20 rounded-xl text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-all text-sm"
            >
              <RotateCcw size={14} />
              Reset to default
            </button>
          )}

          {/* Preview */}
          <section>
            <h3 className="text-sm font-semibold text-on-surface-variant uppercase tracking-wider mb-3">Preview</h3>
            <div className="flex gap-2">
              <div className="flex-1 h-10 rounded-lg flex items-center justify-center text-xs font-bold text-on-primary" style={{ backgroundColor: theme.colors.primary }}>
                Primary
              </div>
              <div className="flex-1 h-10 rounded-lg flex items-center justify-center text-xs font-bold" style={{ backgroundColor: theme.colors.secondary, color: isDark ? '#1a0a2e' : '#fff' }}>
                Secondary
              </div>
              <div className="flex-1 h-10 rounded-lg flex items-center justify-center text-xs font-bold" style={{ backgroundColor: theme.colors.tertiary, color: isDark ? '#2e0a1e' : '#fff' }}>
                Tertiary
              </div>
            </div>
          </section>
        </div>
      </motion.div>
    </div>
  );
};

export default ThemeSettings;
