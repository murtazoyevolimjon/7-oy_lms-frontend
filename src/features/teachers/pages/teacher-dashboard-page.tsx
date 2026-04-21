import { useEffect, useMemo, useState } from 'react';
import { authStore } from '@/features/auth/store/auth.store';
import { teachersApi } from '@/api/teachers.api';

type TeacherGroup = {
    id: number;
    name: string;
    lessonTime?: string | null;
    roomName?: string | null;
    lessonDays?: string[];
};

const weekdayKeys = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'] as const;
const weekdayLabels = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];

const getWeekdayKey = (date: Date) => {
    const jsDay = date.getDay();
    return weekdayKeys[(jsDay + 6) % 7];
};

const buildCalendar = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();
    const startOffset = (firstDay.getDay() + 6) % 7;
    const slots = Array.from({ length: 42 }, (_, index) => {
        const dayNumber = index - startOffset + 1;
        if (dayNumber < 1 || dayNumber > totalDays) return null;
        return new Date(year, month, dayNumber);
    });
    return slots;
};

export default function TeacherDashboardPage() {
    const user = authStore.getUser();
    const [groups, setGroups] = useState<TeacherGroup[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const res = await teachersApi.myGroups();
                setGroups(res?.data || res || []);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    const today = new Date();
    const monthName = today.toLocaleDateString('uz-UZ', { month: 'long', year: 'numeric' });
    const calendarDays = useMemo(() => buildCalendar(today.getFullYear(), today.getMonth()), [today]);

    const lessonDaySet = useMemo(() => {
        const set = new Set<string>();
        groups.forEach((group) => {
            (group.lessonDays || []).forEach((day) => set.add(day));
        });
        return set;
    }, [groups]);

    const todaysLessons = useMemo(() => {
        const todayKey = getWeekdayKey(today);
        return groups.filter((group) => group.lessonDays?.includes(todayKey));
    }, [groups, today]);

    const quickStats = [
        { title: 'Bugungi darslar', value: String(todaysLessons.length), note: "Reja bo'yicha" },
        { title: 'Tekshiriladigan vazifalar', value: '0', note: 'Kutilmoqda' },
        { title: 'Faol guruhlar', value: String(groups.length), note: 'Jami' },
    ];

    return (
        <div className="space-y-8 animate-fade-up">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-semibold text-slate-900">Assalomu alaykum, {user?.fullName || 'Teacher'}!</h1>
                    <p className="mt-1 text-slate-500">Bugungi ishlar rejasini shu yerda kuzating.</p>
                </div>
                <div className="rounded-2xl border border-white/85 bg-white/80 px-4 py-3 text-sm text-slate-600 shadow-sm backdrop-blur">
                    Bugungi sana: {today.toLocaleDateString('uz-UZ')}
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
                {quickStats.map((item) => (
                    <div key={item.title} className="glass-panel lift-on-hover rounded-3xl border border-white/85 bg-gradient-to-br from-white via-cyan-50/70 to-emerald-50/60 p-6">
                        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{item.title}</p>
                        <div className="mt-3 text-3xl font-semibold text-slate-900">{item.value}</div>
                        <p className="mt-2 text-xs text-slate-500">{item.note}</p>
                    </div>
                ))}
            </div>

            <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
                <div className="glass-panel rounded-3xl border border-white/85 bg-white/75 p-6">
                    <div className="flex items-center justify-between">
                        <h3 className="text-lg font-semibold text-slate-800">Dars jadvali</h3>
                        <span className="text-xs text-slate-400">{monthName}</span>
                    </div>
                    <div className="mt-4 grid grid-cols-7 gap-2 text-xs text-slate-400">
                        {weekdayLabels.map((label) => (
                            <div key={label} className="text-center">
                                {label}
                            </div>
                        ))}
                    </div>
                    <div className="mt-2 grid grid-cols-7 gap-2 text-sm">
                        {calendarDays.map((date, index) => {
                            if (!date) return <div key={`empty-${index}`} className="h-12" />;
                            const isToday = date.toDateString() === today.toDateString();
                            const hasLesson = lessonDaySet.has(getWeekdayKey(date));
                            return (
                                <div
                                    key={date.toISOString()}
                                    className={`flex h-12 flex-col items-center justify-center rounded-2xl border ${isToday ? 'border-cyan-500 bg-gradient-to-br from-cyan-500 to-teal-500 text-white' : 'border-slate-100 bg-white/85 text-slate-700'}`}
                                >
                                    <span className="text-sm font-medium">{date.getDate()}</span>
                                    {hasLesson && <span className="mt-1 h-1.5 w-1.5 rounded-full bg-red-500" />}
                                </div>
                            );
                        })}
                    </div>
                    {loading && <p className="mt-4 text-xs text-slate-400">Yuklanmoqda...</p>}
                </div>

                <div className="glass-panel rounded-3xl border border-white/85 bg-gradient-to-br from-white via-sky-50/60 to-emerald-50/60 p-6">
                    <h3 className="text-lg font-semibold text-slate-800">Bugungi darslar</h3>
                    {todaysLessons.length === 0 ? (
                        <p className="mt-2 text-sm text-slate-500">Hozircha darslar yo'q</p>
                    ) : (
                        <div className="mt-4 space-y-3">
                            {todaysLessons.map((lesson) => (
                                <div key={lesson.id} className="rounded-2xl border border-white/85 bg-white/90 px-4 py-3 text-sm shadow-sm">
                                    <p className="font-medium text-slate-800">{lesson.name}</p>
                                    <p className="text-xs text-slate-500">{lesson.lessonTime || '-'} • {lesson.roomName || '-'}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
