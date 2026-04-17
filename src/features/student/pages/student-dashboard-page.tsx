import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock3 } from 'lucide-react';
import { studentsApi } from '@/api/students.api';

type ScheduleItem = {
    id: string;
    date: Date;
    title: string;
    time: string;
    roomName?: string | null;
    groupName?: string | null;
};

const weekLabels = ['D', 'S', 'C', 'P', 'J', 'S', 'Y'];

const toDateKey = (date: Date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, '0');
    const day = `${date.getDate()}`.padStart(2, '0');
    return `${year}-${month}-${day}`;
};

export default function StudentDashboardPage() {
    const [currentMonth, setCurrentMonth] = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });
    const [selectedDay, setSelectedDay] = useState(() => new Date());
    const [schedules, setSchedules] = useState<ScheduleItem[]>([]);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await studentsApi.myDashboard();
                const data = res?.data || res || [];
                setSchedules(
                    data.map((item: any) => ({
                        id: String(item.id),
                        date: new Date(item.date),
                        title: item.title,
                        time: item.time || '-',
                        roomName: item.roomName || null,
                        groupName: item.groupName || null,
                    })),
                );
            } catch {
                setSchedules([]);
            }
        };

        load();
    }, []);

    const calendarDays = useMemo(() => {
        const year = currentMonth.getFullYear();
        const month = currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const monthLength = new Date(year, month + 1, 0).getDate();
        const offset = (firstDay.getDay() + 6) % 7;

        const cells: Array<Date | null> = [];

        for (let i = 0; i < offset; i += 1) {
            cells.push(null);
        }

        for (let day = 1; day <= monthLength; day += 1) {
            cells.push(new Date(year, month, day));
        }

        return cells;
    }, [currentMonth]);

    const eventDateSet = useMemo(() => {
        return new Set(schedules.map((item) => toDateKey(item.date)));
    }, [schedules]);

    const selectedKey = toDateKey(selectedDay);
    const selectedSchedules = schedules.filter((item) => toDateKey(item.date) === selectedKey);

    const currentMonthLabel = currentMonth.toLocaleDateString('uz-UZ', {
        month: 'long',
        year: 'numeric',
    });

    const goPrevMonth = () => {
        setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
    };

    const goNextMonth = () => {
        setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
    };

    return (
        <div className="space-y-7">
            <div className="space-y-4">
                <h2 className="text-2xl font-medium text-slate-800">Dars jadvali</h2>

                <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                        <div className="mb-5 flex items-center justify-between">
                            <p className="text-xl font-medium text-slate-700">{currentMonthLabel}</p>
                            <div className="flex items-center gap-2 text-slate-500">
                                <button
                                    type="button"
                                    onClick={goPrevMonth}
                                    className="rounded-lg p-1 transition hover:bg-slate-100"
                                    aria-label="Oldingi oy"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    type="button"
                                    onClick={goNextMonth}
                                    className="rounded-lg p-1 transition hover:bg-slate-100"
                                    aria-label="Keyingi oy"
                                >
                                    <ChevronRight size={18} />
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-7 gap-2 text-center text-xs text-slate-500">
                            {weekLabels.map((day) => (
                                <div key={day} className="py-2 font-medium">
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="mt-2 grid grid-cols-7 gap-2 text-center">
                            {calendarDays.map((day, index) => {
                                if (!day) {
                                    return <div key={`empty-${index}`} className="h-10" />;
                                }

                                const dayNumber = day.getDate();
                                const dayKey = toDateKey(day);
                                const isSelected = dayKey === selectedKey;
                                const hasEvent = eventDateSet.has(dayKey);

                                return (
                                    <button
                                        key={dayKey}
                                        type="button"
                                        onClick={() => setSelectedDay(day)}
                                        className={`relative h-10 rounded-full text-sm transition ${hasEvent
                                            ? 'bg-rose-500 text-white'
                                            : 'text-slate-700 hover:bg-slate-100'
                                            } ${isSelected && !hasEvent ? 'border border-slate-400 bg-white font-semibold text-slate-800' : ''}`}
                                    >
                                        {dayNumber}
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="space-y-3">
                        {selectedSchedules.map((item) => (
                            <article key={item.id} className="rounded-3xl border border-emerald-200 bg-emerald-100/60 p-5">
                                <h3 className="mb-3 text-xl font-medium text-slate-700">{item.title}</h3>
                                <div className="flex items-center gap-2 text-slate-700">
                                    <Clock3 size={20} />
                                    <span className="text-lg font-medium">{item.time}</span>
                                </div>
                                {(item.roomName || item.groupName) && (
                                    <p className="mt-2 text-sm text-slate-600">
                                        {item.groupName ? `${item.groupName} · ` : ''}{item.roomName || ''}
                                    </p>
                                )}
                            </article>
                        ))}

                        {selectedSchedules.length === 0 && (
                            <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-500">
                                Tanlangan kun uchun dars topilmadi.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
