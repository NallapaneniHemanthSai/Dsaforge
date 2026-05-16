import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth } from './AuthContext';
import api from '../api';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const { user } = useAuth();
  const [theme, setTheme] = useState('system');
  const [activeTheme, setActiveTheme] = useState('light');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') || 'system';
    const initialTheme = user?.theme || storedTheme;
    setTheme(initialTheme);
  }, [user]);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    let resolvedTheme = theme;
    if (theme === 'system') {
      resolvedTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }

    root.classList.add(resolvedTheme);
    setActiveTheme(resolvedTheme);
  }, [theme]);

  const changeTheme = async (newTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    if (user) {
      try {
        await api.patch('/user/settings', { theme: newTheme });
      } catch (error) {
        console.error('Failed to save theme preference', error);
      }
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, activeTheme, changeTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
