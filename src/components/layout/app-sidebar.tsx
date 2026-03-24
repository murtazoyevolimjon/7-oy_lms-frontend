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
  { to: '/', label: 'Asosiy', icon: LayoutDashboard, color: 'text-orange-500' },
  { to: '/teachers', label: "O'qituvchilar", icon: GraduationCap, color: 'text-green-500' },
  { to: '/groups', label: 'Guruhlar', icon: Users, color: 'text-blue-500' },
  { to: '/students', label: 'Talabalar', icon: BookOpen, color: 'text-purple-500' },
];

const managementItems = [
  { to: '/management/courses', label: 'Kurslar', icon: BookMarked, color: 'text-pink-500' },
  { to: '/management/rooms', label: 'Xonalar', icon: DoorOpen, color: 'text-yellow-500' },
  { to: '/management/employees', label: 'Xodimlar', icon: UserCog, color: 'text-cyan-500' },
];

export function AppSidebar() {
  const navigate = useNavigate();
  const [managementOpen, setManagementOpen] = useState(false);

  const handleLogout = () => {
    authStore.clear();
    navigate('/login');
  };

  return (
    <aside className="flex h-screen w-64 shrink-0 flex-col border-r bg-white p-4">
      <div className="mb-6 px-2 text-2xl font-bold text-violet-600">Najot Ta'lim</div>
      <nav className="flex-1 space-y-1">
        {mainItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition',
                  isActive ? 'bg-violet-600 text-white' : 'text-slate-700 hover:bg-slate-100',
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
              managementOpen ? 'bg-violet-50 text-violet-600' : 'text-slate-700 hover:bg-slate-100',
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
            <div className="ml-4 mt-1 space-y-1 border-l-2 border-violet-100 pl-3">
              {managementItems.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    className={({ isActive }) =>
                      cn(
                        'flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition',
                        isActive ? 'bg-violet-600 text-white' : 'text-slate-700 hover:bg-slate-100',
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
        className="mt-4 flex items-center gap-3 rounded-xl bg-red-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-red-600"
      >
        <LogOut size={18} />
        Chiqish
      </button>
    </aside>
  );
}