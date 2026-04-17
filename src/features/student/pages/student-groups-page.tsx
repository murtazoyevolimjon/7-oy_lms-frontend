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
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-slate-800">Guruhlarim</h1>
            </div>

            <div className="flex gap-2 border-b">
                <button
                    onClick={() => setTab('active')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'active'
                        ? 'border-amber-500 text-amber-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Faol
                </button>
                <button
                    onClick={() => setTab('archived')}
                    className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${tab === 'archived'
                        ? 'border-amber-500 text-amber-600'
                        : 'border-transparent text-slate-500 hover:text-slate-700'
                        }`}
                >
                    Tugagan
                </button>
            </div>

            {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}

            <div className="rounded-2xl border border-slate-200 bg-white">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 text-slate-500">
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
                                        className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
                                    >
                                        <td className="px-4 py-3 text-slate-500">{index + 1}</td>
                                        <td className="px-4 py-3">
                                            <button
                                                type="button"
                                                onClick={(event) => {
                                                    event.stopPropagation();
                                                    navigate(`/student/groups/${group.id}`);
                                                }}
                                                className="font-medium text-amber-600 hover:underline"
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
