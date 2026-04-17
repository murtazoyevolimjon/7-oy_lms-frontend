import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { teachersApi } from '@/api/teachers.api';

type TeacherGroup = {
    id: number;
    name: string;
    courseName?: string | null;
    startDate?: string | null;
    lessonTime?: string | null;
    roomName?: string | null;
    studentsCount?: number | null;
};

type TabKey = 'active' | 'archived';

export default function TeacherGroupsPage() {
    const navigate = useNavigate();
    const [groups, setGroups] = useState<TeacherGroup[]>([]);
    const [tab, setTab] = useState<TabKey>('active');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [query, setQuery] = useState('');

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            setError('');
            try {
                const res = await teachersApi.myGroups();
                setGroups(res?.data || res || []);
            } catch {
                setError("Guruhlar ro'yxatini yuklashda xatolik");
            } finally {
                setLoading(false);
            }
        };

        load();
    }, []);

    const filteredGroups = useMemo(() => {
        if (tab === 'archived') return [];
        if (!query.trim()) return groups;
        const normalized = query.trim().toLowerCase();
        return groups.filter((group) => group.name.toLowerCase().includes(normalized));
    }, [groups, tab, query]);

    const totalStudents = useMemo(() => {
        return groups.reduce((sum, group) => sum + Number(group.studentsCount || 0), 0);
    }, [groups]);

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold text-slate-900">Guruhlar</h1>
                    <p className="text-sm text-slate-500">Sizga biriktirilgan guruhlar ro'yxati</p>
                </div>
                <input
                    className="w-full max-w-xs rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm"
                    placeholder="Qidirish..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs text-slate-400">Jami guruhlar</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{groups.length}</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs text-slate-400">O'qituvchilar</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">1</p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                    <p className="text-xs text-slate-400">Talabalar</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900">{totalStudents}</p>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setTab('active')}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${tab === 'active'
                        ? 'bg-slate-900 text-white'
                        : 'border border-slate-200 text-slate-600 hover:bg-white'
                        }`}
                >
                    Asosiy
                </button>
                <button
                    onClick={() => setTab('archived')}
                    className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${tab === 'archived'
                        ? 'bg-slate-900 text-white'
                        : 'border border-slate-200 text-slate-600 hover:bg-white'
                        }`}
                >
                    Arxivdagilar
                </button>
            </div>

            {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}

            <div className="rounded-2xl border border-slate-200 bg-white">
                <div className="overflow-x-auto">
                    <table className="min-w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-200 text-slate-500">
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Guruh</th>
                                <th className="px-4 py-3">Kurs</th>
                                <th className="px-4 py-3">Dars vaqti</th>
                                <th className="px-4 py-3">Xona</th>
                                <th className="px-4 py-3">Talabalar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                                        Yuklanmoqda...
                                    </td>
                                </tr>
                            ) : filteredGroups.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                                        Guruhlar mavjud emas
                                    </td>
                                </tr>
                            ) : (
                                filteredGroups.map((group) => (
                                    <tr
                                        key={group.id}
                                        onClick={() => navigate(`/teacher/groups/${group.id}`)}
                                        className="cursor-pointer border-b border-slate-100 hover:bg-slate-50"
                                    >
                                        <td className="px-4 py-3">
                                            <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700">ACTIVE</span>
                                        </td>
                                        <td className="px-4 py-3 font-medium text-slate-800">{group.name}</td>
                                        <td className="px-4 py-3 text-slate-600">{group.courseName || '-'}</td>
                                        <td className="px-4 py-3 text-slate-600">{group.lessonTime || '-'}</td>
                                        <td className="px-4 py-3 text-slate-600">{group.roomName || '-'}</td>
                                        <td className="px-4 py-3 text-slate-600">{group.studentsCount ?? 0}</td>
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
