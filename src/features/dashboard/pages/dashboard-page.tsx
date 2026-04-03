import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

interface DashboardStats {
  activeStudents: number;
  groups: number;
  frozen: number;
  archived: number;
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats>({
    activeStudents: 0,
    groups: 0,
    frozen: 0,
    archived: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL;

        const [studentsRes, groupsRes] = await Promise.all([
          fetch(`${baseUrl}/students`),
          fetch(`${baseUrl}/groups`),
        ]);

        const studentsData = await studentsRes.json();
        const groupsData = await groupsRes.json();

        const students = Array.isArray(studentsData)
          ? studentsData
          : studentsData?.data || [];

        const groups = Array.isArray(groupsData)
          ? groupsData
          : groupsData?.data || [];

        const activeStudents = students.filter(
          (s: any) => String(s.status).toUpperCase() === 'ACTIVE'
        ).length;

        const frozen = students.filter(
          (s: any) => String(s.status).toUpperCase() === 'FROZEN'
        ).length;

        const archived = students.filter(
          (s: any) => String(s.status).toUpperCase() === 'ARCHIVED'
        ).length;

        setStats({
          activeStudents,
          groups: Array.isArray(groups) ? groups.length : 0,
          frozen,
          archived,
        });
      } catch (error) {
        console.error('Dashboard stats xatolik:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    { label: t('activeStudents'), value: stats.activeStudents },
    { label: t('groups'), value: stats.groups },
    { label: t('frozen'), value: stats.frozen },
    { label: t('archived'), value: stats.archived },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold dark:text-white">{t('hello')}</h1>
        <p className="mt-1 text-slate-500 dark:text-slate-400">{t('welcome')}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((item) => (
          <div
            key={item.label}
            className="rounded-2xl border bg-white dark:bg-slate-800 dark:border-slate-700 p-6 shadow-sm"
          >
            <p className="text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
            <div className="mt-4 text-4xl font-bold dark:text-white">
              {loading ? (
                <span className="inline-block w-10 h-8 bg-slate-200 dark:bg-slate-600 rounded animate-pulse" />
              ) : (
                item.value
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-2xl border bg-white dark:bg-slate-800 dark:border-slate-700 p-6 text-slate-500 dark:text-slate-400">
        {t('dashboardHint')}
      </div>
    </div>
  );
}