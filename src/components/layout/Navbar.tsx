'use client';

import { useAuthStore } from '@/store/authStore';
import { LogOut, User as UserIcon, Settings, Bell, Search } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { ThemeToggle } from './ThemeToggle';

export function Navbar() {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    document.cookie = 'accessToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT;';
    router.push('/login/admin');
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-white px-4 dark:bg-gray-800 dark:border-gray-700 md:px-6">
      <div className="flex items-center gap-4">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <input
            type="search"
            placeholder="Search..."
            className="w-64 rounded-lg border border-gray-300 bg-gray-50 pl-9 py-2 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary dark:border-gray-600 dark:bg-gray-700 dark:text-white"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ThemeToggle />
        <button className="relative rounded-full p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800" aria-label="Notifications">
          <Bell className="h-5 w-5" />
          <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500"></span>
        </button>

        <div className="flex items-center gap-3 pl-2 border-l dark:border-gray-700 ml-2">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-medium text-gray-900 dark:text-white">{user?.fullName || 'User'}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">{user?.role.toLowerCase() || 'Role'}</p>
          </div>
          <div className="group relative">
             <button className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary border border-primary/20" aria-label="User menu">
                {user?.photo ? (
                    <img src={user.photo} alt={user.fullName} className="h-full w-full rounded-full object-cover" />
                ) : (
                    <UserIcon className="h-6 w-6" />
                )}
             </button>
             <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-700 hidden group-hover:block border dark:border-gray-600">
                <a href="/profile" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600">
                  <UserIcon className="mr-3 h-4 w-4" /> Profile
                </a>
                <a href="/settings" className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-600">
                  <Settings className="mr-3 h-4 w-4" /> Settings
                </a>
                <button onClick={handleLogout} className="flex w-full items-center px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-600">
                  <LogOut className="mr-3 h-4 w-4" /> Sign out
                </button>
             </div>
          </div>
        </div>
      </div>
    </header>
  );
}
