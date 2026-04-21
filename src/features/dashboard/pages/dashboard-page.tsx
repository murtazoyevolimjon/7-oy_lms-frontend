import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '@/api/axios';
import { useNavigate } from 'react-router-dom';
import {
  Archive,
  CalendarDays,
  CircleDollarSign,
  Clock3,
  FolderArchive,
  Snowflake,
  Users,
  UsersRound,
} from 'lucide-react';

interface DashboardStats {
  activeStudents: number;
  totalStudents: number;
  groups: number;
  frozen: number;
  archived: number;
}

export default function DashboardPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    activeStudents: 0,
    totalStudents: 0,
    groups: 0,
    frozen: 0,
    archived: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/students/stats/summary');
        const payload = data?.data || {};

        setStats({
          activeStudents: Number(payload.activeStudents || 0),
          totalStudents: Number(payload.totalStudents || 0),
          groups: Number(payload.groups || 0),
          frozen: Number(payload.frozen || 0),
          archived: Number(payload.archived || 0),
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
    {
      label: t('activeStudents'),
      value: stats.activeStudents,
      onClick: () => navigate('/admin/students?status=ACTIVE'),
      icon: UsersRound,
      iconColor: 'text-violet-600 dark:text-violet-300',
      iconBg: 'bg-violet-100 dark:bg-violet-500/20',
    },
    {
      label: t('groups'),
      value: stats.groups,
      onClick: () => navigate('/admin/groups'),
      icon: Users,
      iconColor: 'text-indigo-600 dark:text-indigo-300',
      iconBg: 'bg-indigo-100 dark:bg-indigo-500/20',
    },
    {
      label: t('frozen'),
      value: stats.frozen,
      onClick: () => navigate('/admin/students?status=FREEZE'),
      icon: Snowflake,
      iconColor: 'text-cyan-600 dark:text-cyan-300',
      iconBg: 'bg-cyan-100 dark:bg-cyan-500/20',
    },
    {
      label: t('archived'),
      value: stats.archived,
      onClick: undefined,
      icon: FolderArchive,
      iconColor: 'text-amber-600 dark:text-amber-300',
      iconBg: 'bg-amber-100 dark:bg-amber-500/20',
    },
  ];

  const paymentCards = [
    {
      key: 'paid',
      label: t('paymentsPaid'),
      amount: "0 so'm",
      icon: CircleDollarSign,
      tone: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
    },
    {
      key: 'pending',
      label: t('paymentsPending'),
      amount: "0 so'm",
      icon: Clock3,
      tone: 'bg-amber-50 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
    },
    {
      key: 'debt',
      label: t('paymentsDebt'),
      amount: "0 so'm",
      icon: Archive,
      tone: 'bg-rose-50 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
    },
  ];

  return (
    <div className="space-y-5 animate-fade-up">
      <div className="glass-panel rounded-3xl border border-white/80 p-6">
        <h2 className="text-3xl font-bold tracking-tight brand-gradient-text">
          {t('najotTitle')}
        </h2>
        <p className="mt-1 text-slate-600 dark:text-slate-300">{t('dashboardSubTitle')}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {statCards.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={item.onClick}
            disabled={!item.onClick}
            className={`glass-panel lift-on-hover rounded-2xl border border-white/80 p-5 text-left transition dark:border-slate-700 dark:bg-slate-900 ${item.onClick ? 'cursor-pointer' : 'cursor-default'
              }`}
          >
            <div className={`mb-3 inline-flex h-9 w-9 items-center justify-center rounded-xl ${item.iconBg}`}>
              <item.icon size={18} className={item.iconColor} />
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">{item.label}</p>
            <div className="mt-2 text-3xl font-bold dark:text-white">
              {loading ? (
                <span className="inline-block h-7 w-8 animate-pulse rounded bg-slate-200 dark:bg-slate-600" />
              ) : (
                item.value
              )}
            </div>
          </button>
        ))}
      </div>

      <div className="glass-panel rounded-2xl border border-white/80 p-5 dark:border-slate-700 dark:bg-slate-900">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{t('monthlyPayments')}</h3>
        <div className="mt-3 grid gap-2 md:grid-cols-3">
          {paymentCards.map((card) => (
            <div key={card.key} className={`rounded-2xl p-4 shadow-sm ${card.tone}`}>
              <div className="flex items-center gap-2">
                <card.icon size={16} />
                <p className="text-sm font-medium">{card.label}</p>
              </div>
              <p className="mt-2 text-3xl font-bold">{card.amount}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-panel rounded-2xl border border-white/80 p-5 dark:border-slate-700 dark:bg-slate-900">
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{t('lessonSchedule')}</h3>
        <div className="mt-3 flex items-center gap-3 rounded-2xl border border-white/80 bg-white/75 px-3 py-2.5 text-slate-600 dark:border-slate-700 dark:text-slate-400">
          <CalendarDays size={16} />
          <span>{t('noLessonToday')}</span>
        </div>
      </div>
    </div>
  );
}