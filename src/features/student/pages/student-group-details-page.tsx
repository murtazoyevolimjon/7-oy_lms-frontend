import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { studentsApi } from '@/api/students.api';
import { homeworkResponseApi } from '@/api/homework-response.api';
import { formatDate } from '@/lib/utils';

type StudentGroup = {
    id: number;
    name: string;
    courseName?: string | null;
    teacherName?: string | null;
    startDate?: string | null;
};

type Lesson = {
    id: number;
    title: string;
    created_at?: string;
};

type Homework = {
    id: number;
    title: string;
    file?: string | null;
    durationTime?: number;
    created_at?: string;
    uploadedBy?: string | null;
};

type HomeworkResponse = {
    id: number;
    title: string;
    file?: string | null;
    created_at?: string;
};

type HomeworkResult = {
    id: number;
    score?: number | null;
    status?: string | null;
    title?: string | null;
};

type HomeworkData = {
    homework: Homework;
    response?: HomeworkResponse | null;
    result?: HomeworkResult | null;
};

type LessonVideo = {
    id: number;
    file: string;
    created_at?: string;
    lesson?: { id: number; title: string };
    uploadedBy?: string | null;
};

type StatusFilter = 'all' | 'submitted' | 'not-submitted' | 'no-homework';

const formatDateTime = (value?: string | null) => {
    if (!value) return '-';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '-';
    return date.toLocaleString('uz-UZ');
};

const getDeadline = (homework?: Homework | null) => {
    if (!homework?.created_at) return '-';
    const base = new Date(homework.created_at);
    if (Number.isNaN(base.getTime())) return '-';
    const hours = Number(homework.durationTime || 0);
    const deadline = new Date(base.getTime() + hours * 60 * 60 * 1000);
    return deadline.toLocaleString('uz-UZ');
};

export default function StudentGroupDetailsPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const groupId = Number(id);

    const [group, setGroup] = useState<StudentGroup | null>(null);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [homeworks, setHomeworks] = useState<Record<number, HomeworkData | null>>({});
    const [videos, setVideos] = useState<LessonVideo[]>([]);
    const [videoCounts, setVideoCounts] = useState<Record<number, number>>({});
    const [filter, setFilter] = useState<StatusFilter>('all');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);
    const [selectedVideoId, setSelectedVideoId] = useState<number | null>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);

    const [showSubmit, setShowSubmit] = useState(false);
    const [selectedHomeworkId, setSelectedHomeworkId] = useState<number | null>(null);
    const [submitForm, setSubmitForm] = useState({ title: '', file: null as File | null });
    const [submitLoading, setSubmitLoading] = useState(false);

    const loadGroup = async () => {
        const res = await studentsApi.myGroups();
        const list: StudentGroup[] = res?.data || res || [];
        const selected = list.find((g) => g.id === groupId) || null;
        setGroup(selected);
    };

    const loadLessons = async () => {
        const res = await studentsApi.myLessons(groupId);
        setLessons(res?.data || res || []);
    };

    const loadHomeworks = async (lessonList: Lesson[]) => {
        const entries = await Promise.all(
            lessonList.map(async (lesson) => {
                try {
                    const res = await studentsApi.myGroupHomework(groupId, lesson.id);
                    return [lesson.id, res?.data || res] as const;
                } catch {
                    return [lesson.id, null] as const;
                }
            })
        );

        const mapped: Record<number, HomeworkData | null> = {};
        entries.forEach(([lessonId, payload]) => {
            if (!payload) {
                mapped[lessonId] = null;
                return;
            }
            mapped[lessonId] = payload.homework
                ? payload
                : { homework: payload, response: null, result: null };
        });
        setHomeworks(mapped);
    };

    const loadVideos = async () => {
        const res = await studentsApi.myGroupVideos(groupId);
        const list = res?.data || res || [];
        const counts: Record<number, number> = {};
        list.forEach((item: any) => {
            const lessonId = item.lesson?.id ?? item.lessonId;
            if (!lessonId) return;
            counts[lessonId] = (counts[lessonId] || 0) + 1;
        });
        setVideos(list);
        setVideoCounts(counts);
    };

    const refreshHomework = async (lessonId: number) => {
        const res = await studentsApi.myGroupHomework(groupId, lessonId);
        setHomeworks((prev) => ({
            ...prev,
            [lessonId]: res?.data || res,
        }));
    };

    useEffect(() => {
        if (!groupId) return;
        const loadAll = async () => {
            setLoading(true);
            setError('');
            try {
                await Promise.all([loadGroup(), loadVideos()]);
                const lessonRes = await studentsApi.myLessons(groupId);
                const lessonList = lessonRes?.data || lessonRes || [];
                setLessons(lessonList);
                setSelectedLessonId(lessonList[0]?.id ?? null);
                await loadHomeworks(lessonList);
            } catch {
                setError("Ma'lumotlarni yuklashda xatolik");
            } finally {
                setLoading(false);
            }
        };

        loadAll();
    }, [groupId]);

    const getRowStatus = (lessonId: number) => {
        const payload = homeworks[lessonId];
        if (!payload) return 'no-homework';
        if (payload.response?.id) return 'submitted';
        return 'not-submitted';
    };

    const filteredLessons = useMemo(() => {
        if (filter === 'all') return lessons;
        return lessons.filter((lesson) => getRowStatus(lesson.id) === filter);
    }, [lessons, filter, homeworks]);

    const selectedLesson = lessons.find((lesson) => lesson.id === selectedLessonId) || null;
    const selectedHomework = selectedLessonId ? homeworks[selectedLessonId] : null;
    const lessonVideos = selectedLessonId
        ? videos.filter((video) => video.lesson?.id === selectedLessonId)
        : [];
    const selectedVideo = lessonVideos.find((video) => video.id === selectedVideoId) || lessonVideos[0] || null;

    useEffect(() => {
        if (!selectedLessonId) return;
        const nextVideo = lessonVideos[0];
        setSelectedVideoId(nextVideo?.id ?? null);
    }, [selectedLessonId, videos]);

    const handleLessonSelect = (lessonId: number) => {
        setSelectedLessonId(lessonId);
        requestAnimationFrame(() => {
            contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    };

    const getVideoName = (fileUrl?: string | null) => {
        if (!fileUrl) return '-';
        try {
            const name = fileUrl.split('/').pop() || '';
            return decodeURIComponent(name);
        } catch {
            return 'Video';
        }
    };

    const handleOpenSubmit = (homeworkId: number) => {
        setSelectedHomeworkId(homeworkId);
        setSubmitForm({ title: '', file: null });
        setShowSubmit(true);
    };

    const handleSubmitHomework = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedHomeworkId) return;
        if (!submitForm.title.trim()) {
            setError('Izoh majburiy');
            return;
        }

        setSubmitLoading(true);
        setError('');
        try {
            await homeworkResponseApi.create({
                homeworkId: selectedHomeworkId,
                title: submitForm.title.trim(),
                file: submitForm.file,
            });
            setShowSubmit(false);
            setSubmitForm({ title: '', file: null });

            const lessonId = lessons.find((lesson) => {
                const payload = homeworks[lesson.id];
                return payload?.homework?.id === selectedHomeworkId;
            })?.id;

            if (lessonId) {
                await refreshHomework(lessonId);
            }
        } catch (err: any) {
            const msg = err?.response?.data?.message;
            setError(Array.isArray(msg) ? msg.join(', ') : msg || "Uyga vazifani topshirishda xatolik");
        } finally {
            setSubmitLoading(false);
        }
    };

    if (loading) {
        return <div className="flex h-64 items-center justify-center text-slate-400">Yuklanmoqda...</div>;
    }

    if (!group) {
        return (
            <div className="space-y-3">
                <button
                    onClick={() => navigate('/student/groups')}
                    className="text-sm text-slate-500 hover:text-amber-600"
                >
                    Orqaga
                </button>
                <p className="text-slate-500">Guruh topilmadi</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <button
                        onClick={() => navigate('/student/groups')}
                        className="text-sm text-slate-500 hover:text-amber-600"
                    >
                        Orqaga
                    </button>
                    <h1 className="text-2xl font-bold text-slate-800">{group.name}</h1>
                    <p className="text-sm text-slate-500">
                        {group.courseName || '-'} · {group.teacherName || '-'}
                    </p>
                </div>
                <div className="text-sm text-slate-500">Boshlanish: {formatDate(group.startDate)}</div>
            </div>

            {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>}

            <div className="flex flex-wrap items-center gap-3">
                <label className="text-sm text-slate-500">Uyga vazifa statusi</label>
                <select
                    value={filter}
                    onChange={(e) => setFilter(e.target.value as StatusFilter)}
                    className="rounded-xl border border-slate-200 px-3 py-2 text-sm"
                >
                    <option value="all">Barchasi</option>
                    <option value="submitted">Topshirilgan</option>
                    <option value="not-submitted">Berilmagan</option>
                    <option value="no-homework">Uyga vazifa yo'q</option>
                </select>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_280px]">
                <div className="space-y-6" ref={contentRef}>
                    <div className="rounded-2xl border border-slate-200 bg-white p-4">
                        {selectedVideo ? (
                            <div className="space-y-4">
                                <video className="w-full max-h-[360px] rounded-xl bg-black/5 object-contain" controls src={selectedVideo.file} />
                                <div className="flex flex-wrap items-center justify-between gap-3">
                                    <div>
                                        <p className="text-sm text-slate-500">Dars</p>
                                        <p className="text-base font-semibold text-slate-800">
                                            {selectedLesson?.title || '-'}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-slate-500">Video nomi</p>
                                        <p className="text-sm font-medium text-slate-700">
                                            {getVideoName(selectedVideo.file)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                    <span>Yuklagan: {selectedVideo.uploadedBy || group.teacherName || '-'}</span>
                                    <span>Qo'shilgan: {formatDateTime(selectedVideo.created_at)}</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex h-64 items-center justify-center text-slate-400">
                                Bu darsda video mavjud emas
                            </div>
                        )}
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <div className="mb-3 flex items-center justify-between">
                            <h3 className="text-base font-semibold text-slate-800">Uyga vazifa</h3>
                            {selectedHomework?.homework && (
                                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600">
                                    Muddat: {getDeadline(selectedHomework.homework)}
                                </span>
                            )}
                        </div>

                        {!selectedHomework?.homework ? (
                            <div className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-400">
                                Bu dars uchun uyga vazifa mavjud emas.
                            </div>
                        ) : (
                            <div className="space-y-4">
                                <div className="rounded-xl bg-slate-50 p-4 text-sm text-slate-700">
                                    {selectedHomework.homework.title}
                                </div>
                                <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                                    <span>Yuklagan: {selectedHomework.homework.uploadedBy || group.teacherName || '-'}</span>
                                    <span>Qo'shilgan: {formatDateTime(selectedHomework.homework.created_at)}</span>
                                </div>
                                {selectedHomework.homework.file && (
                                    <Link
                                        to={selectedHomework.homework.file}
                                        className="text-sm font-medium text-amber-600 hover:underline"
                                        target="_blank"
                                        rel="noreferrer"
                                    >
                                        Uyga vazifa faylini ochish
                                    </Link>
                                )}

                                <div className="rounded-xl border border-slate-200 p-4">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-xs text-slate-500">Mening topshirig'im</p>
                                            <p className="text-sm font-medium text-slate-700">
                                                {selectedHomework.response?.title || 'Topshirilmagan'}
                                            </p>
                                        </div>
                                        {selectedHomework.response?.file ? (
                                            <Link
                                                to={selectedHomework.response.file}
                                                className="text-xs font-medium text-amber-600 hover:underline"
                                                target="_blank"
                                                rel="noreferrer"
                                            >
                                                Faylni ko'rish
                                            </Link>
                                        ) : null}
                                    </div>
                                    {selectedHomework.result && (
                                        <div className="mt-3 text-xs text-slate-500">
                                            Natija: {selectedHomework.result.status || '-'} · Ball: {selectedHomework.result.score ?? '-'}
                                        </div>
                                    )}
                                </div>

                                {!selectedHomework.response?.id && (
                                    <button
                                        onClick={() => handleOpenSubmit(selectedHomework.homework.id)}
                                        className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-700 hover:bg-amber-100"
                                    >
                                        Topshirish
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="rounded-2xl border border-slate-200 bg-white p-5">
                        <h3 className="mb-3 text-base font-semibold text-slate-800">Videolar</h3>
                        {lessonVideos.length === 0 ? (
                            <div className="rounded-xl border border-dashed border-slate-200 p-4 text-sm text-slate-400">
                                Bu dars uchun video mavjud emas.
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {lessonVideos.map((video) => (
                                    <button
                                        key={video.id}
                                        type="button"
                                        onClick={() => setSelectedVideoId(video.id)}
                                        className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-left text-sm transition ${selectedVideoId === video.id
                                            ? 'border-amber-300 bg-amber-50'
                                            : 'border-slate-200 hover:bg-slate-50'
                                            }`}
                                    >
                                        <div>
                                            <p className="font-medium text-slate-700">{getVideoName(video.file)}</p>
                                            <p className="text-xs text-slate-500">{formatDateTime(video.created_at)}</p>
                                        </div>
                                        <span className="text-xs text-slate-400">{video.uploadedBy || group.teacherName || '-'}</span>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <aside className="space-y-3">
                    {filteredLessons.length === 0 ? (
                        <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-400">
                            Darslar mavjud emas
                        </div>
                    ) : (
                        filteredLessons.map((lesson) => {
                            const payload = homeworks[lesson.id];
                            const status = getRowStatus(lesson.id);
                            const videoCount = videoCounts[lesson.id] || 0;

                            return (
                                <button
                                    key={lesson.id}
                                    type="button"
                                    onClick={() => handleLessonSelect(lesson.id)}
                                    className={`w-full rounded-2xl border px-4 py-3 text-left transition ${selectedLessonId === lesson.id
                                        ? 'border-amber-300 bg-amber-50'
                                        : 'border-slate-200 bg-white hover:bg-slate-50'
                                        }`}
                                >
                                    <p className="text-sm font-semibold text-slate-800">{lesson.title}</p>
                                    <p className="text-xs text-slate-500">{formatDateTime(lesson.created_at)}</p>
                                    <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                                        <span className="rounded-full border border-slate-200 px-2 py-0.5">Video: {videoCount}</span>
                                        <span className="rounded-full border border-slate-200 px-2 py-0.5">
                                            {status === 'submitted'
                                                ? 'Topshirilgan'
                                                : payload?.homework
                                                    ? 'Berilmagan'
                                                    : "Vazifa yo'q"}
                                        </span>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </aside>
            </div>

            {showSubmit && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-lg rounded-2xl bg-white p-6">
                        <h2 className="text-lg font-semibold text-slate-800">Uyga vazifa topshirish</h2>
                        <p className="mt-1 text-sm text-slate-500">Izoh yozish majburiy</p>

                        <form onSubmit={handleSubmitHomework} className="mt-4 space-y-4">
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">Izoh</label>
                                <textarea
                                    value={submitForm.title}
                                    onChange={(e) => setSubmitForm((prev) => ({ ...prev, title: e.target.value }))}
                                    className="min-h-[110px] w-full rounded-xl border border-slate-200 px-3 py-2 text-sm outline-none focus:border-amber-300"
                                    placeholder="Izoh yozing"
                                    required
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium text-slate-700">Fayl (ixtiyoriy)</label>
                                <input
                                    type="file"
                                    onChange={(e) =>
                                        setSubmitForm((prev) => ({
                                            ...prev,
                                            file: e.target.files?.[0] || null,
                                        }))
                                    }
                                    className="block w-full text-sm text-slate-600"
                                />
                            </div>

                            <div className="flex justify-end gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowSubmit(false)}
                                    className="rounded-xl border border-slate-200 px-4 py-2 text-sm"
                                >
                                    Bekor qilish
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitLoading}
                                    className="rounded-xl bg-amber-600 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                                >
                                    {submitLoading ? 'Yuborilmoqda...' : 'Topshirish'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
