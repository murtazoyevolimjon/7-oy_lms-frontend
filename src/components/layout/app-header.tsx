import { useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { authStore } from '@/features/auth/store/auth.store';
import { themeStore } from '@/store/theme.store';
import { Bell, ChevronDown, Moon, Sun } from 'lucide-react';
import { paymentsApi } from '@/api/payments.api';

type AdminPaymentNotification = {
  id: number;
  message: string;
  amount: number;
  currency: string;
  paidAt: string;
};

const ADMIN_NOTIFICATION_SEEN_KEY = 'crm-admin-payment-notifications-seen';

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
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<AdminPaymentNotification[]>([]);
  const [seenNotificationIds, setSeenNotificationIds] = useState<number[]>([]);
  const languageRef = useRef<HTMLDivElement | null>(null);
  const notificationsRef = useRef<HTMLDivElement | null>(null);
  const resolvedRole = authStore.getResolvedRole();
  const isAdmin = ['ADMIN', 'SUPERADMIN', 'ADMINSTRATOR', 'MANAGEMENT'].includes(
    (resolvedRole || '').toUpperCase(),
  );

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

      if (!notificationsRef.current) return;
      if (!notificationsRef.current.contains(event.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const raw = localStorage.getItem(ADMIN_NOTIFICATION_SEEN_KEY);
    if (!raw) return;

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setSeenNotificationIds(parsed.filter((id) => Number.isFinite(id)));
      }
    } catch {
      setSeenNotificationIds([]);
    }
  }, []);

  useEffect(() => {
    if (!isAdmin) {
      setNotifications([]);
      return;
    }

    const loadNotifications = async () => {
      try {
        const data = await paymentsApi.getAdminNotifications();
        setNotifications(Array.isArray(data) ? data : []);
      } catch {
        setNotifications([]);
      }
    };

    loadNotifications();
    const timer = window.setInterval(loadNotifications, 30000);
    return () => window.clearInterval(timer);
  }, [isAdmin]);

  const unreadCount = useMemo(() => {
    return notifications.filter((notification) => !seenNotificationIds.includes(notification.id)).length;
  }, [notifications, seenNotificationIds]);

  const toggleNotifications = () => {
    const nextOpen = !isNotificationsOpen;
    setIsNotificationsOpen(nextOpen);

    if (!nextOpen) return;

    const allIds = notifications.map((notification) => notification.id);
    setSeenNotificationIds(allIds);
    localStorage.setItem(ADMIN_NOTIFICATION_SEEN_KEY, JSON.stringify(allIds));
  };

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
    <header className="sticky top-0 z-30 flex items-center justify-end gap-4 border-b border-white/80 bg-white/55 px-4 py-3 backdrop-blur-xl sm:px-6 dark:border-slate-700 dark:bg-slate-900/85">
      <div className="absolute left-1/2 top-1/2 hidden w-[min(58vw,680px)] -translate-x-1/2 -translate-y-1/2 lg:block">
        <h1 className="truncate text-center text-[1.65rem] font-bold text-slate-900 dark:text-white">
          {t('helloUser', { name: user?.fullName || 'Admin' })}
        </h1>
      </div>

      <div className="relative z-10 flex items-center gap-2 sm:gap-3">
        <div ref={languageRef} className="relative">
          <button
            type="button"
            onClick={() => setIsLanguageOpen((prev) => !prev)}
            className="brand-gradient flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
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

        <div ref={notificationsRef} className="relative">
          <button
            type="button"
            onClick={toggleNotifications}
            className="relative rounded-xl border border-white/80 bg-white/80 p-2.5 text-orange-500 transition hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-amber-300 dark:hover:bg-slate-700"
            aria-label="Bildirishnomalar"
          >
            <Bell size={18} />
            {isAdmin && unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold text-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {isNotificationsOpen && isAdmin && (
            <div className="absolute right-0 z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl dark:border-slate-700 dark:bg-slate-900">
              <div className="border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                <p className="text-sm font-semibold text-slate-900 dark:text-white">To'lov bildirishnomalari</p>
              </div>

              <div className="max-h-80 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="px-4 py-6 text-sm text-slate-500 dark:text-slate-400">Hozircha yangi to'lov yo'q</p>
                ) : (
                  notifications.map((notification) => (
                    <div key={notification.id} className="border-b border-slate-100 px-4 py-3 text-sm dark:border-slate-800">
                      <p className="font-medium text-slate-800 dark:text-slate-200">{notification.message}</p>
                      <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                        {new Date(notification.paidAt).toLocaleString('uz-UZ')}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          className="rounded-xl border border-white/80 bg-white/80 p-2.5 text-slate-600 transition hover:bg-white dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          aria-label="Mavzuni almashtirish"
        >
          {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
        </button>

        <div className="brand-gradient flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-white shadow-md shadow-sky-600/30">
          {userInitial}
        </div>
      </div>
    </header>
  );
}