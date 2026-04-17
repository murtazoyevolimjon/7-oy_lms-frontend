import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { authStore } from '@/features/auth/store/auth.store';
import { Bell, LogOut, User } from 'lucide-react';

export function TeacherLayout() {
    const navigate = useNavigate();
    const user = authStore.getUser();

    const handleLogout = () => {
        authStore.clear();
        navigate('/login');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 via-white to-slate-200">
            <div className="flex min-h-screen">
                <aside className="hidden w-72 shrink-0 border-r border-slate-200 bg-slate-900 text-slate-100 lg:flex lg:flex-col">
                    <div className="px-6 pb-6 pt-6">
                        <div className="mb-8">
                            <h2 className="text-2xl font-semibold text-white">Najot Ta'lim</h2>
                        </div>
                        <nav className="space-y-2">
                            <NavLink
                                to="/teacher/profile"
                                className={({ isActive }) =>
                                    `flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition ${isActive
                                        ? 'bg-white text-slate-900'
                                        : 'text-slate-300 hover:bg-slate-800'
                                    }`
                                }
                            >
                                <span>Profil</span>
                                <span className="text-xs text-slate-400">01</span>
                            </NavLink>
                            <NavLink
                                to="/teacher/groups"
                                className={({ isActive }) =>
                                    `flex items-center justify-between rounded-2xl px-4 py-3 text-sm font-medium transition ${isActive
                                        ? 'bg-white text-slate-900'
                                        : 'text-slate-300 hover:bg-slate-800'
                                    }`
                                }
                            >
                                <span>Guruhlar</span>
                                <span className="text-xs text-slate-400">02</span>
                            </NavLink>
                        </nav>
                    </div>
                    <div className="mt-auto px-6 pb-6">
                        <div className="rounded-2xl bg-slate-800 p-4 text-xs text-slate-300">
                            Bugungi reja: dars mavzularini yakunlab chiqing.
                        </div>
                    </div>
                </aside>

                <div className="flex min-w-0 flex-1 flex-col">
                    <header className="flex h-20 items-center justify-between border-b border-slate-200 bg-white/80 px-6 backdrop-blur">
                        <div>
                            <p className="text-lg font-semibold text-slate-800">Salom, {user?.fullName || 'Teacher'}!</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="grid h-10 w-10 place-items-center rounded-xl border border-slate-200 bg-white text-slate-600">
                                <Bell size={18} />
                            </button>
                            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600">
                                <User size={16} />
                                {user?.fullName || 'Teacher'}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600"
                                aria-label="Chiqish"
                            >
                                <LogOut size={18} />
                            </button>
                        </div>
                    </header>

                    <main className="p-6">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
}
