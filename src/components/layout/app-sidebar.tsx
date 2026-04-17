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
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white/95 p-4 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
      <div className="mb-6 px-2 text-2xl font-bold text-violet-600 dark:text-violet-400">Najot Ta'lim</div>
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
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition',
                  isActive
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm'
                    : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
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
              'flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition',
              managementOpen
                ? 'bg-violet-50 text-violet-600 dark:bg-violet-500/20 dark:text-violet-300'
                : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
            )}
          >
            <Settings size={18} className={managementOpen ? 'text-violet-600' : 'text-rose-500'} />
            <span className="flex-1 text-left">Boshqarish</span>
            {managementOpen
              ? <ChevronDown size={16} />
              : <ChevronRight size={16} />
            }
          </button>

          {managementOpen && (
            <div className="ml-4 mt-1 space-y-1 border-l-2 border-violet-100 pl-3 dark:border-violet-800">
              {managementItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition',
                        isActive
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white'
                          : 'text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-800',
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
        className="mt-4 flex items-center justify-center gap-3 rounded-xl bg-red-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-red-600"
      >
        <LogOut size={18} />
        Chiqish
      </button>
    </aside>
  );
}