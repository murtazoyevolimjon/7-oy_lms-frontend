import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { authStore } from '@/features/auth/store/auth.store';
import { themeStore } from '@/store/theme.store';
import { Bell, ChevronDown, Moon, Sun } from 'lucide-react';

const languageOptions = [
  { code: 'uz', label: "O'zbekcha" },
  { code: 'en', label: 'English' },
  { code: 'ru', label: 'Русский' },
];

export function AppHeader() {
  const user = authStore.getUser();
  const { t, i18n } = useTranslation();
  const [theme, setTheme] = useState<'light' | 'dark'>(
    themeStore.getTheme() as 'light' | 'dark'
  );
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);
  const languageRef = useRef<HTMLDivElement | null>(null);

  const currentLanguage = useMemo(() => {
    const normalized = (i18n.language || 'uz').split('-')[0];
    return languageOptions.find((option) => option.code === normalized) ?? languageOptions[0];
  }, [i18n.language]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!languageRef.current) return;
      if (!languageRef.current.contains(event.target as Node)) {
        setIsLanguageOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const changeLanguage = (lang: string) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('lang', lang);
    setIsLanguageOpen(false);
  };

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(nextTheme);
    themeStore.setTheme(nextTheme);
  };

  const userInitial = user?.fullName?.trim()?.charAt(0)?.toUpperCase() || 'A';

  return (
    <header className="sticky top-0 z-30 flex items-center justify-end gap-4 border-b border-slate-200 bg-white/90 px-6 py-4 backdrop-blur dark:border-slate-700 dark:bg-slate-900/85">
      <div className="absolute left-1/2 top-1/2 w-[min(60vw,680px)] -translate-x-1/2 -translate-y-1/2">
        <h1 className="truncate text-center text-2xl font-bold text-slate-900 dark:text-white">
          {t('helloUser', { name: user?.fullName || 'Admin' })}
        </h1>
      </div>

      <div className="relative z-10 flex items-center gap-2 sm:gap-3">
        <div ref={languageRef} className="relative">
          <button
            type="button"
            onClick={() => setIsLanguageOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
          >
            {currentLanguage.label}
            <ChevronDown
              size={16}
              className={`transition ${isLanguageOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {isLanguageOpen && (
            <div className="absolute right-0 mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xl dark:border-slate-700 dark:bg-slate-900">
              {languageOptions.map((option) => (
                <button
                  key={option.code}
                  type="button"
                  onClick={() => changeLanguage(option.code)}
                  className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition ${currentLanguage.code === option.code
                    ? 'bg-violet-50 font-semibold text-violet-700 dark:bg-violet-500/20 dark:text-violet-300'
                    : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                >
                  {option.label}
                  {currentLanguage.code === option.code ? <span>✓</span> : null}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          className="rounded-xl border border-slate-200 bg-white p-2.5 text-amber-500 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-amber-300 dark:hover:bg-slate-700"
          aria-label="Bildirishnomalar"
        >
          <Bell size={18} />
        </button>

        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-xl border border-slate-200 bg-white p-2.5 text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          aria-label="Mavzuni almashtirish"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-amber-700 to-orange-600 text-sm font-bold text-white shadow">
          {userInitial}
        </div>
      </div>
    </header>
  );
}