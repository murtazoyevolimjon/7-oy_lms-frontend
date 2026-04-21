import { useEffect, useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Clock3, CreditCard } from 'lucide-react';
import { studentsApi } from '@/api/students.api';
import { PaymentModal } from '@/features/payments/components/payment-modal';
import { authStore } from '@/features/auth/store/auth.store';

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
    const user = authStore.getUser();
    const studentId = Number(user?.id || 0);
    const [currentMonth, setCurrentMonth] = useState(() => {
        const now = new Date();
        return new Date(now.getFullYear(), now.getMonth(), 1);
    });
    const [selectedDay, setSelectedDay] = useState(() => new Date());
    const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [studentGroupId, setStudentGroupId] = useState<number>(1);

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

    useEffect(() => {
        const loadMyGroups = async () => {
            try {
                const res = await studentsApi.myGroups();
                const groups = Array.isArray(res) ? res : (res?.data ?? []);
                const firstGroupId = Number(groups?.[0]?.groupId || groups?.[0]?.id || 1);
                if (Number.isFinite(firstGroupId) && firstGroupId > 0) {
                    setStudentGroupId(firstGroupId);
                }
            } catch {
                setStudentGroupId(1);
            }
        };

        loadMyGroups();
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
        <div className="space-y-7 animate-fade-up">
            {/* Payment Quick Card */}
            <div className="glass-panel lift-on-hover relative overflow-hidden rounded-3xl border border-white/85 p-6">
                <div className="pointer-events-none absolute -right-10 -top-10 h-36 w-36 rounded-full bg-cyan-200/45 blur-2xl" />
                <div className="pointer-events-none absolute -bottom-12 -left-10 h-40 w-40 rounded-full bg-amber-200/45 blur-2xl" />
                <div className="relative z-10 flex items-center justify-between gap-4">
                    <div>
                        <h3 className="text-lg font-bold text-slate-900">To'lovni amalga oshiring</h3>
                        <p className="mt-1 text-sm text-slate-600">Kartangiz orqali tez va qulay tarzda to'lang</p>
                    </div>
                    <button
                        onClick={() => setIsPaymentModalOpen(true)}
                        className="brand-gradient flex items-center gap-2 rounded-2xl px-6 py-3 font-semibold text-white shadow-lg shadow-cyan-500/30 transition hover:-translate-y-0.5"
                    >
                        <CreditCard size={18} />
                        To'lov qilish
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                <h2 className="text-2xl font-medium text-slate-800">Dars jadvali</h2>

                <div className="grid gap-5 lg:grid-cols-[340px_1fr]">
                    <div className="glass-panel rounded-3xl border border-white/85 bg-white/75 p-5 shadow-[0_18px_45px_rgba(14,116,144,0.12)]">
                        <div className="mb-5 flex items-center justify-between">
                            <p className="text-xl font-semibold text-slate-800">{currentMonthLabel}</p>
                            <div className="flex items-center gap-2 text-slate-500">
                                <button
                                    type="button"
                                    onClick={goPrevMonth}
                                    className="rounded-lg p-1 transition hover:bg-white/80"
                                    aria-label="Oldingi oy"
                                >
                                    <ChevronLeft size={18} />
                                </button>
                                <button
                                    type="button"
                                    onClick={goNextMonth}
                                    className="rounded-lg p-1 transition hover:bg-white/80"
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
                                            ? 'brand-gradient text-white'
                                            : 'text-slate-700 hover:bg-white/95'
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
                            <article key={item.id} className="glass-panel rounded-3xl border border-emerald-200/80 bg-gradient-to-br from-emerald-50/80 via-cyan-50/70 to-white p-5">
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
                            <div className="glass-panel rounded-3xl border border-white/85 bg-white/70 p-6 text-slate-500">
                                Tanlangan kun uchun dars topilmadi.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                studentGroupId={studentGroupId}
                studentId={studentId || 1}
            />
        </div>
    );
}
