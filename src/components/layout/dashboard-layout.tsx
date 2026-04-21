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
    <div className="ambient-grid relative min-h-screen bg-transparent lg:p-4">
      <div className="flex min-h-screen overflow-hidden rounded-none lg:rounded-[30px] lg:border lg:border-white/70 lg:bg-white/30 lg:shadow-[0_30px_80px_rgba(15,23,42,0.12)] lg:backdrop-blur">
        <AppSidebar />
        <div className="flex-1">
          <AppHeader />
          <main className="p-4 sm:p-6 lg:p-7">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}