import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  GraduationCap,
  Users,
  BookOpen,
  Settings,
  ChevronDown,
  ChevronRight,
  LogOut,
  BookMarked,
  DoorOpen,
  UserCog,
} from 'lucide-react';
import { authStore } from '@/features/auth/store/auth.store';

const mainItems = [
  { to: '/admin/dashboard', label: 'Asosiy', icon: LayoutDashboard, color: 'text-orange-500' },
  { to: '/admin/teachers', label: "O'qituvchilar", icon: GraduationCap, color: 'text-green-500' },
  { to: '/admin/groups', label: 'Guruhlar', icon: Users, color: 'text-blue-500' },
  { to: '/admin/students', label: 'Talabalar', icon: BookOpen, color: 'text-purple-500' },
];

const managementItems = [
  { to: '/admin/management/courses', label: 'Kurslar', icon: BookMarked, color: 'text-pink-500' },
  { to: '/admin/management/rooms', label: 'Xonalar', icon: DoorOpen, color: 'text-yellow-500' },
  { to: '/admin/management/employees', label: 'Xodimlar', icon: UserCog, color: 'text-cyan-500' },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const [managementOpen, setManagementOpen] = useState(false);

  const handleLogout = () => {
    authStore.clear();
    navigate('/login');
  };

  return (
    <aside className="glass-panel hidden h-screen w-72 shrink-0 flex-col border-r border-white/75 p-5 lg:flex">
      <div className="mb-7 rounded-2xl border border-white/70 bg-white/75 p-4 shadow-sm">
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.22em] text-sky-700/80">Learning CRM</p>
        <div className="text-2xl font-bold brand-gradient-text">Najot Ta'lim</div>
      </div>

      <nav className="flex-1 space-y-1">
        {mainItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/admin/dashboard'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold transition',
                  isActive
                    ? 'brand-gradient text-white shadow-lg shadow-sky-500/25'
                    : 'text-slate-700 hover:bg-white/80 hover:shadow-sm dark:text-slate-200 dark:hover:bg-slate-800',
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className={isActive ? 'text-white' : item.color} />
                  {item.label}
                </>
              )}
            </NavLink>
          );
        })}

        {/* Boshqarish dropdown */}
        <div>
          <button
            onClick={() => setManagementOpen(!managementOpen)}
            className={cn(
              'flex w-full items-center gap-3 rounded-2xl px-4 py-3.5 text-sm font-semibold transition',
              managementOpen
                ? 'bg-sky-50 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300'
                : 'text-slate-700 hover:bg-white/80 dark:text-slate-200 dark:hover:bg-slate-800',
            )}
          >
            <Settings size={18} className={managementOpen ? 'text-sky-700' : 'text-orange-500'} />
            <span className="flex-1 text-left">Boshqarish</span>
            {managementOpen
              ? <ChevronDown size={16} />
              : <ChevronRight size={16} />
            }
          </button>

          {managementOpen && (
            <div className="ml-4 mt-2 space-y-1 border-l-2 border-sky-100 pl-3 dark:border-sky-800">
              {managementItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition',
                        isActive
                          ? 'brand-gradient text-white'
                          : 'text-slate-700 hover:bg-white/80 dark:text-slate-200 dark:hover:bg-slate-800',
                      )
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <Icon size={16} className={isActive ? 'text-white' : item.color} />
                        {item.label}
                      </>
                    )}
                  </NavLink>
                );
              })}
            </div>
          )}
        </div>
      </nav>

      <button
        onClick={handleLogout}
        className="mt-4 flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-orange-500 to-rose-500 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-orange-400/20 transition hover:brightness-105"
      >
        <LogOut size={18} />
        Chiqish
      </button>
    </aside>
  );
}