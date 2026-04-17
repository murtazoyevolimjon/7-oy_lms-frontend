import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { authStore } from '@/features/auth/store/auth.store';
import {
    Bell,
    BookOpenCheck,
    ChartColumnBig,
    CreditCard,
    Home,
    LogOut,
    Settings,
    ShoppingCart,
    UsersRound,
    type LucideIcon,
} from 'lucide-react';

type StudentMenuItem = {
    label: string;
    icon: LucideIcon;
    to?: string;
    disabled?: boolean;
};

const menuItems: StudentMenuItem[] = [
    { label: 'Bosh sahifa', icon: Home, to: '/student/dashboard' },
    { label: "To'lovlarim", icon: CreditCard, disabled: true },
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

    const handleLogout = () => {
        authStore.clear();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-slate-200/60">
            <div className="flex min-h-screen">
                <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
                    <div className="px-7 pb-4 pt-6">
                        <div className="mb-6 flex items-center gap-3">
                            <div className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                                Beta
                            </div>
                            <h2 className="text-2xl font-black tracking-tight text-slate-800">NAJOT TA'LIM</h2>
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
                                            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-slate-500"
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
                                                ? 'bg-amber-50 text-amber-700'
                                                : 'text-slate-700 hover:bg-slate-100'
                                            }`
                                        }
                                    >
                                        {({ isActive }) => (
                                            <>
                                                <Icon size={20} className={isActive ? 'text-amber-600' : 'text-slate-500'} />
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
                    <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white px-5 lg:justify-end lg:px-8">
                        <div className="lg:hidden">
                            <p className="text-xs font-semibold uppercase tracking-wide text-violet-600">Student panel</p>
                            <h3 className="text-lg font-semibold text-slate-900">{user?.fullName || 'Student'}</h3>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                type="button"
                                className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-100"
                                aria-label="Bildirishnomalar"
                            >
                                <Bell size={18} />
                            </button>

                            <button
                                onClick={handleLogout}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition hover:bg-slate-100"
                                aria-label="Chiqish"
                                title="Chiqish"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    </header>

                    <main className="p-4 lg:p-8">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
}
