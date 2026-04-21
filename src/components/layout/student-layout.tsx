import { useEffect, useRef, useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { authStore } from '@/features/auth/store/auth.store';
import { themeStore } from '@/store/theme.store';
import {
    Bell,
    BookOpenCheck,
    ChartColumnBig,
    ChevronDown,
    CreditCard,
    Home,
    LogOut,
    Moon,
    Settings,
    ShoppingCart,
    Sun,
    UsersRound,
    type LucideIcon,
} from 'lucide-react';

const languageOptions = [
    { code: 'uz', label: "O'zbekcha" },
    { code: 'en', label: 'English' },
    { code: 'ru', label: 'Русский' },
];

type StudentMenuItem = {
    label: string;
    icon: LucideIcon;
    to?: string;
    disabled?: boolean;
};

const menuItems: StudentMenuItem[] = [
    { label: 'Bosh sahifa', icon: Home, to: '/student/dashboard' },
    { label: "To'lovlarim", icon: CreditCard, to: '/student/payments' },
    { label: 'Guruhlarim', icon: UsersRound, to: '/student/groups' },
    { label: "Ko'rsatgichlarim", icon: ChartColumnBig, disabled: true },
    { label: 'Rating', icon: ChartColumnBig, disabled: true },
    { label: "Do'kon", icon: ShoppingCart, disabled: true },
    { label: "Qo'shimcha darslar", icon: BookOpenCheck, to: '/student/homework' },
    { label: 'Sozlamalar', icon: Settings, to: '/student/profile' },
];

export function StudentLayout() {
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
            <div className="pointer-events-none absolute -left-16 top-12 h-56 w-56 rounded-full bg-cyan-200/40 blur-3xl" />
            <div className="pointer-events-none absolute -right-16 bottom-8 h-64 w-64 rounded-full bg-orange-200/40 blur-3xl" />

            <div className="relative z-10 flex min-h-screen">
                <aside className="glass-panel hidden w-72 shrink-0 border-r border-white/85 bg-gradient-to-b from-white/85 via-cyan-50/70 to-white/85 lg:flex lg:flex-col lg:rounded-[26px]">
                    <div className="px-7 pb-4 pt-6">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="inline-flex items-center rounded-full border border-orange-200 bg-orange-100/90 px-3 py-1 text-xs font-semibold text-orange-700">
                                Student
                            </div>
                            <h2 className="text-2xl font-black tracking-tight brand-gradient-text">NAJOT TA'LIM</h2>
                        </div>

                        <nav className="space-y-2">
                            {menuItems.map((item) => {
                                const Icon = item.icon;

                                if (!item.to || item.disabled) {
                                    return (
                                        <button
                                            key={item.label}
                                            type="button"
                                            disabled
                                            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-slate-500 opacity-70"
                                            title="Tez orada"
                                        >
                                            <Icon size={20} className="text-slate-400" />
                                            <span className="text-base font-medium leading-5">{item.label}</span>
                                        </button>
                                    );
                                }

                                return (
                                    <NavLink
                                        key={item.label}
                                        to={item.to}
                                        className={({ isActive }) =>
                                            `flex items-center gap-3 rounded-2xl px-4 py-3 text-base font-medium transition ${isActive
                                                ? 'brand-gradient text-white shadow-lg shadow-cyan-500/25'
                                                : 'text-slate-700 hover:bg-white/90 hover:text-slate-900'
                                            }`
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                <Icon size={20} className={isActive ? 'text-white' : 'text-slate-500'} />
                                                <span className="leading-5">{item.label}</span>
                                            </>
                                        )}
                                    </NavLink>
                                );
                            })}
                        </nav>
                    </div>
                </aside>

                <div className="flex min-w-0 flex-1 flex-col">
                    <header className="glass-panel flex h-20 items-center justify-between border-b border-white/80 bg-white/70 px-5 lg:justify-end lg:rounded-t-[26px] lg:px-8">
                        <div className="lg:hidden">
                            <p className="text-xs font-semibold uppercase tracking-wide text-sky-700">Student panel</p>
                            <h3 className="text-lg font-semibold text-slate-900">{user?.fullName || 'Student'}</h3>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                className="grid h-10 w-10 place-items-center rounded-xl border border-white/80 bg-white/80 text-slate-500 transition hover:bg-white"
                                aria-label="Bildirishnomalar"
                            >
                                <Bell size={18} />
                            </button>

                            <button
                                onClick={toggleTheme}
                                className="grid h-10 w-10 place-items-center rounded-xl border border-white/80 bg-white/80 text-slate-500 transition hover:bg-white"
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

                            <button
                                onClick={handleLogout}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-white/80 bg-white/80 text-slate-600 transition hover:bg-white"
                                aria-label="Chiqish"
                                title="Chiqish"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    </header>

                    <main className="p-4 lg:rounded-b-[26px] lg:p-8">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
}
