import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

const AccessibilityContext = createContext(null);

export const AccessibilityProvider = ({ children }) => {
  const { user, updatePreferences } = useAuth();

  const [settings, setSettings] = useState(() => {
    const stored = localStorage.getItem('sahyatri_accessibility');
    return stored ? JSON.parse(stored) : {
      mode: 'none',           // none | wheelchair | elderly | visually_impaired
      avoidStairs: false,
      preferLift: false,
      highContrast: false,
      largeText: false,
      language: 'en',
    };
  });

  // Apply accessibility classes to body
  useEffect(() => {
    document.body.classList.toggle('high-contrast', settings.highContrast);
    document.body.classList.toggle('large-text', settings.largeText);
  }, [settings.highContrast, settings.largeText]);

  // Sync from user profile when logged in
  useEffect(() => {
    if (user?.preferences) {
      const synced = {
        mode: user.preferences.accessibilityMode || 'none',
        avoidStairs: user.preferences.avoidStairs || false,
        preferLift: user.preferences.preferLift || false,
        highContrast: user.preferences.highContrast || false,
        largeText: user.preferences.largeText || false,
        language: user.preferences.language || 'en',
      };
      setSettings(synced);
    }
  }, [user]);

  const updateSettings = async (newSettings) => {
    const merged = { ...settings, ...newSettings };
    setSettings(merged);
    localStorage.setItem('sahyatri_accessibility', JSON.stringify(merged));
    if (user) {
      try {
        await updatePreferences({
          accessibilityMode: merged.mode,
          avoidStairs: merged.avoidStairs,
          preferLift: merged.preferLift,
          highContrast: merged.highContrast,
          largeText: merged.largeText,
          language: merged.language,
        });
      } catch (_) {}
    }
  };

  const isAccessible = settings.mode !== 'none' || settings.avoidStairs;

  return (
    <AccessibilityContext.Provider value={{ settings, updateSettings, isAccessible }}>
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const ctx = useContext(AccessibilityContext);
  if (!ctx) throw new Error('useAccessibility must be used within AccessibilityProvider');
  return ctx;
};
