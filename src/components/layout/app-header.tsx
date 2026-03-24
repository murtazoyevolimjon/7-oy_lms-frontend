import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { authStore } from '@/features/auth/store/auth.store';
import { themeStore } from '@/store/theme.store';
import { Sun, Moon } from 'lucide-react';

export function AppHeader() {
  const user = authStore.getUser();
  const { t, i18n } = useTranslation();
  const [theme, setTheme] = useState<'light' | 'dark'>(
    themeStore.getTheme() as 'light' | 'dark'
  );

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
  };

  const toggleTheme = (mode: 'light' | 'dark') => {
    setTheme(mode);
    themeStore.setTheme(mode);
  };

  return (
    <header className="flex items-center justify-between border-b bg-white dark:bg-slate-900 dark:border-slate-700 px-6 py-4">
      <input
        placeholder={t('search')}
        className="w-80 rounded-xl border px-4 py-2 outline-none focus:ring-2 focus:ring-violet-200 dark:bg-slate-800 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
      />
      <div className="flex items-center gap-3">

        {/* Dark / Light toggle */}
        <div className="flex items-center gap-1 rounded-xl border bg-slate-100 dark:bg-slate-800 dark:border-slate-600 p-1">
          <button
            onClick={() => toggleTheme('light')}
            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
              theme === 'light'
                ? 'bg-white shadow text-yellow-500 dark:bg-slate-700'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Sun size={16} />
          </button>
          <button
            onClick={() => toggleTheme('dark')}
            className={`flex items-center gap-1 rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
              theme === 'dark'
                ? 'bg-white shadow text-violet-600 dark:bg-slate-700'
                : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Moon size={16} />
          </button>
        </div>

        {/* Til tanlash */}
        <div className="flex items-center gap-1 rounded-xl border bg-slate-100 dark:bg-slate-800 dark:border-slate-600 p-1">
          {[
            { code: 'uz', label: "O'zbekcha" },
            { code: 'en', label: 'English' },
            { code: 'ru', label: 'Русский' },
          ].map((lang) => (
            <button
              key={lang.code}
              onClick={() => changeLanguage(lang.code)}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-all ${
                i18n.language === lang.code
                  ? 'bg-white shadow text-violet-600 dark:bg-slate-700 dark:text-violet-400'
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
            >
              {lang.label}
            </button>
          ))}
        </div>

        {/* User */}
        <div className="rounded-full bg-violet-100 dark:bg-violet-900 px-4 py-2 text-sm font-medium text-violet-700 dark:text-violet-300">
          {user?.fullName || 'Admin'}
        </div>
      </div>
    </header>
  );
}