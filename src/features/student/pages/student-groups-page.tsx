import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { studentsApi } from '@/api/students.api';
import { formatDate } from '@/lib/utils';

type StudentGroup = {
    id: number;
    name: string;
    courseName?: string | null;
    teacherName?: string | null;
    startDate?: string | null;
};

type TabKey = 'active' | 'archived';

export default function StudentGroupsPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const [groups, setGroups] = useState<StudentGroup[]>([]);
    const [tab, setTab] = useState<TabKey>('active');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const groupIdParam = searchParams.get('groupId');
        if (groupIdParam && Number.isFinite(Number(groupIdParam))) {
            navigate(`/student/groups/${groupIdParam}`, { replace: true });
            return;
        }

        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await studentsApi.myGroups();
                setGroups(res?.data || res || []);
            } catch {
                setError("Guruhlar ro'yxatini yuklashda xatolik");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, [navigate, searchParams]);

    const filteredGroups = useMemo(() => {
        if (tab === 'archived') return [];
        return groups;
    }, [groups, tab]);

    return (
        <div className="space-y-5 animate-fade-up">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800">Guruhlarim</h1>
            </div>

            <div className="glass-panel inline-flex rounded-2xl border border-white/85 p-1">
                <button
                    onClick={() => setTab('active')}
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${tab === 'active'
                        ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-md'
                        : 'text-slate-500 hover:bg-white/80 hover:text-slate-700'
                        }`}
                >
                    Faol
                </button>
                <button
                    onClick={() => setTab('archived')}
                    className={`rounded-xl px-4 py-2 text-sm font-medium transition-colors ${tab === 'archived'
                        ? 'bg-gradient-to-r from-cyan-500 to-teal-500 text-white shadow-md'
                        : 'text-slate-500 hover:bg-white/80 hover:text-slate-700'
                        }`}
                >
                    Tugagan
                </button>
            </div>

            {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}

            <div className="glass-panel overflow-hidden rounded-3xl border border-white/85 bg-white/80 shadow-[0_20px_50px_rgba(14,116,144,0.12)]">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-white/80 bg-white/60 text-slate-500">
                                <th className="px-4 py-3">#</th>
                                <th className="px-4 py-3">Guruh nomi</th>
                                <th className="px-4 py-3">Yo'nalishi</th>
                                <th className="px-4 py-3">O'qituvchi</th>
                                <th className="px-4 py-3">Boshlash vaqti</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                                        Yuklanmoqda...
                                    </td>
                                </tr>
                            ) : filteredGroups.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-4 py-8 text-center text-slate-400">
                                        Guruhlar mavjud emas
                                    </td>
                                </tr>
                            ) : (
                                filteredGroups.map((group, index) => (
                                    <tr
                                        key={group.id}
                                        onClick={() => navigate(`/student/groups/${group.id}`)}
                                        className="cursor-pointer border-b border-white/80 hover:bg-cyan-50/50"
                                    >
                                        <td className="px-4 py-3 text-slate-500">{index + 1}</td>
                                        <td className="px-4 py-3">
                                            <button
                                                type="button"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    navigate(`/student/groups/${group.id}`);
                                                }}
                                                className="font-medium text-cyan-700 hover:underline"
                                            >
                                                {group.name}
                                            </button>
                                        </td>
                                        <td className="px-4 py-3 text-slate-700">{group.courseName || '-'}</td>
                                        <td className="px-4 py-3 text-slate-700">{group.teacherName || '-'}</td>
                                        <td className="px-4 py-3 text-slate-700">{formatDate(group.startDate)}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
