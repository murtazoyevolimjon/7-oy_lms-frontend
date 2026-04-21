import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authStore } from '@/features/auth/store/auth.store';
import { themeStore } from '@/store/theme.store';
import { Bell, ChevronDown, GraduationCap, LayoutDashboard, LogOut, Moon, Sun, User } from 'lucide-react';

const languageOptions = [
    { code: 'uz', label: "O'zbekcha" },
    { code: 'en', label: 'English' },
    { code: 'ru', label: 'Русский' },
];

export function TeacherLayout() {
    const navigate = useNavigate();
    const user = authStore.getUser();
    const { t, i18n } = useTranslation();
    const [theme, setTheme] = useState<'light' | 'dark'>(themeStore.getTheme() as 'light' | 'dark');
    const [isLanguageOpen, setIsLanguageOpen] = useState(false);
    const languageRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (!languageRef.current?.contains(event.target as Node)) {
                setIsLanguageOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        // Initialize dark mode on mount
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [theme]);

    const currentLanguage = languageOptions.find((option) => option.code === (i18n.language || 'uz').split('-')[0]) ?? languageOptions[0];

    const changeLanguage = (lang: string) => {
        i18n.changeLanguage(lang);
        localStorage.setItem('lang', lang);
        setIsLanguageOpen(false);
    };

    const toggleTheme = () => {
        const nextTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(nextTheme);
        themeStore.setTheme(nextTheme);
        // Apply dark class to html element
        if (nextTheme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    };

    const handleLogout = () => {
        authStore.clear();
        navigate('/login');
    };

    return (
        <div className="ambient-grid relative min-h-screen overflow-hidden bg-transparent lg:p-4">
            <div className="pointer-events-none absolute -left-24 top-10 h-72 w-72 rounded-full bg-teal-200/35 blur-3xl" />
            <div className="pointer-events-none absolute -right-20 top-28 h-64 w-64 rounded-full bg-sky-200/35 blur-3xl" />

            <div className="relative z-10 flex min-h-screen">
                <aside className="glass-panel hidden w-72 shrink-0 border-r border-white/85 bg-gradient-to-b from-white/85 via-emerald-50/70 to-white/85 text-slate-100 lg:flex lg:flex-col lg:rounded-[26px]">
                    <div className="px-6 pb-6 pt-6">
                        <div className="mb-8">
                            <div className="mb-3 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-100/80 px-3 py-1 text-xs font-semibold text-emerald-700">
                                Teacher panel
                            </div>
                            <h2 className="text-2xl font-semibold brand-gradient-text">Najot Ta'lim</h2>
                        </div>
                        <nav className="space-y-2">
                            <NavLink
                                to="/teacher/profile"
                                className={({ isActive }) =>
                                    `flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition ${isActive
                                        ? 'brand-gradient text-white shadow-lg shadow-cyan-500/25'
                                        : 'text-slate-700 hover:bg-white/90 hover:text-slate-900'
                                    }`
                                }
                            >
                                <span className="inline-flex items-center gap-2">
                                    <LayoutDashboard size={16} />
                                    Profil
                                </span>
                                <span className="text-xs text-slate-500">01</span>
                            </NavLink>
                            <NavLink
                                to="/teacher/groups"
                                className={({ isActive }) =>
                                    `flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition ${isActive
                                        ? 'brand-gradient text-white shadow-lg shadow-cyan-500/25'
                                        : 'text-slate-700 hover:bg-white/90 hover:text-slate-900'
                                    }`
                                }
                            >
                                <span className="inline-flex items-center gap-2">
                                    <GraduationCap size={16} />
                                    Guruhlar
                                </span>
                                <span className="text-xs text-slate-500">02</span>
                            </NavLink>
                        </nav>
                    </div>
                    <div className="mt-auto px-6 pb-6">
                        <div className="rounded-2xl border border-white/70 bg-white/70 p-4 text-xs text-slate-700">
                            Bugungi reja: dars mavzularini yakunlab chiqing.
                        </div>
                    </div>
                </aside>

                <div className="flex min-w-0 flex-1 flex-col">
                    <header className="glass-panel flex h-20 items-center justify-between border-b border-white/80 bg-white/70 px-6 lg:rounded-t-[26px]">
                        <div>
                            <p className="text-lg font-semibold text-slate-800">Salom, {user?.fullName || 'Teacher'}!</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="grid h-10 w-10 place-items-center rounded-xl border border-white/90 bg-white/90 text-slate-600 shadow-sm transition hover:scale-[1.03] hover:bg-white" aria-label="Bildirishnomalar">
                                <Bell size={18} />
                            </button>
                            <button
                                onClick={toggleTheme}
                                className="grid h-10 w-10 place-items-center rounded-xl border border-white/90 bg-white/90 text-slate-600 shadow-sm transition hover:scale-[1.03] hover:bg-white"
                                aria-label="Tema o'zgartirish"
                            >
                                {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
                            </button>
                            <div ref={languageRef} className="relative z-50">
                                <button
                                    type="button"
                                    onClick={() => setIsLanguageOpen((prev) => !prev)}
                                    className="brand-gradient flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:shadow-md"
                                >
                                    {currentLanguage.label}
                                    <ChevronDown size={16} className={`transition ${isLanguageOpen ? 'rotate-180' : ''}`} />
                                </button>
                                {isLanguageOpen && (
                                    <div className="absolute right-0 top-full mt-2 w-44 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl z-50">
                                        {languageOptions.map((option) => (
                                            <button
                                                key={option.code}
                                                onClick={() => changeLanguage(option.code)}
                                                className={`w-full px-4 py-2 text-left text-sm transition ${currentLanguage.code === option.code
                                                    ? 'bg-slate-100 font-semibold text-slate-900'
                                                    : 'text-slate-700 hover:bg-slate-50'
                                                    }`}
                                            >
                                                <span className="flex items-center justify-between">
                                                    <span>{option.label}</span>
                                                    {currentLanguage.code === option.code && <span className="text-emerald-600">✓</span>}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2 rounded-full border border-white/90 bg-white/90 px-3 py-2 text-sm text-slate-600 shadow-sm">
                                <User size={16} />
                                {user?.fullName || 'Teacher'}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/90 bg-white/90 text-slate-600 shadow-sm transition hover:scale-[1.03] hover:bg-white"
                                aria-label="Chiqish"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    </header>

                    <main className="p-6 lg:rounded-b-[26px]">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
}
