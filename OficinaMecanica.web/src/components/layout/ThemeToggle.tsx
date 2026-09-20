import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="theme-toggle"
      aria-label={
        theme === 'dark'
          ? 'Ativar tema claro'
          : 'Ativar tema escuro'
      }
      title={
        theme === 'dark'
          ? 'Ativar tema claro'
          : 'Ativar tema escuro'
      }
    >
      {theme === 'dark' ? (
        <Sun size={18} strokeWidth={1.8} />
      ) : (
        <Moon size={18} strokeWidth={1.8} />
      )}
    </button>
  );
}