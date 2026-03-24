import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { authStore } from '@/features/auth/store/auth.store';
import { themeStore } from '@/store/theme.store';
import { AppSidebar } from './app-sidebar';
import { AppHeader } from './app-header';

export function DashboardLayout() {
  const token = authStore.getToken();

  useEffect(() => {
    themeStore.init();
  }, []);

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex bg-slate-50 dark:bg-slate-950 min-h-screen">
      <AppSidebar />
      <div className="flex-1">
        <AppHeader />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}