import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '@/api/axios';
import { groupsApi } from '@/api/groups.api';
import { lessonsApi } from '@/api/lesson.api';
import { homeworkApi } from '@/api/homework.api';
import { videosApi } from '@/api/videos.api';
import { attendanceApi } from '@/api/attendance.api';
import { studentGroupApi } from '@/api/students-group.api';
import { formatDate, formatDateTime } from '@/lib/utils';
import { Pencil, Plus, Trash2 } from 'lucide-react';

type GroupDetails = {
    id: string;
    name: string;
    courseName: string;
    lessonTime: string;
    startDate: string;
    lessonDays: string[];
    lessonDurationMinutes?: number;
    price?: number;
    roomName?: string | null;
    teachers?: { fullName: string }[];
    students?: { id: string; fullName: string; photo?: string }[];
};

type Lesson = {
    id: number;
    title: string;
    created_at?: string;
};

type Homework = {
    id: number;
    title: string;
    lessonId: number;
    created_at?: string;
    durationTime?: number;
};

type Video = {
    id: number;
    lessonId: number;
    file?: string;
    created_at?: string;
};

type HomeworkStatusTab = 'PENDING' | 'NOT_REVIEWED' | 'REJECTED' | 'APPROVED';

type StatusRow = {
    id?: number;
    fullName?: string;
    student?: { id: number; fullName: string };
    file?: string;
    comment?: string;
    submittedAt?: string;
    score?: number | null;
    teacherComment?: string | null;
    resultId?: number;
};

type TeacherOption = {
    id: string;
    fullName: string;
};

type StudentOption = {
    id: number;
    fullName: string;
    email?: string;
};

const weekdayLabel: Record<string, string> = {
    MON: 'Dushanba',
    TUE: 'Seshanba',
    WED: 'Chorshanba',
    THU: 'Payshanba',
    FRI: 'Juma',
    SAT: 'Shanba',
    SUN: 'Yakshanba',
};

const statusLabels: Record<HomeworkStatusTab, string> = {
    PENDING: 'Kutilmoqda',
    NOT_REVIEWED: 'Bajarmagan',
    REJECTED: 'Qaytarilgan',
    APPROVED: 'Qabul qilingan',
};

const cleanLessonTitle = (title?: string) => {
    if (!title) return '';
    return title.replace(/^\s*-{2,}\s*/, '').trim();
};

const GroupDetailsPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [group, setGroup] = useState<GroupDetails | null>(null);
    const [lessons, setLessons] = useState<Lesson[]>([]);
    const [homeworks, setHomeworks] = useState<Homework[]>([]);
    const [videos, setVideos] = useState<Video[]>([]);

    const [tab, setTab] = useState<'info' | 'lessons' | 'attendance'>('info');
    const [subTab, setSubTab] = useState<'lessons' | 'homeworks' | 'videos' | 'exams' | 'journal'>('lessons');

    const [lessonForm, setLessonForm] = useState({ title: '' });
    const [lessonLoading, setLessonLoading] = useState(false);

    const [showEditForm, setShowEditForm] = useState(false);
    const [editName, setEditName] = useState('');
    const [editLoading, setEditLoading] = useState(false);

    const [showHomeworkForm, setShowHomeworkForm] = useState(false);
    const [homeworkForm, setHomeworkForm] = useState<{ lessonId: string; title: string; file: File | null }>({
        lessonId: '',
        title: '',
        file: null,
    });
    const [homeworkLoading, setHomeworkLoading] = useState(false);

    const [showVideoForm, setShowVideoForm] = useState(false);
    const [videoForm, setVideoForm] = useState<{ lessonId: string; file: File | null }>({
        lessonId: '',
        file: null,
    });
    const [videoLoading, setVideoLoading] = useState(false);

    const [showTeacherForm, setShowTeacherForm] = useState(false);
    const [teacherOptions, setTeacherOptions] = useState<TeacherOption[]>([]);
    const [selectedTeacherId, setSelectedTeacherId] = useState('');
    const [teacherLoading, setTeacherLoading] = useState(false);

    const [showStudentForm, setShowStudentForm] = useState(false);
    const [studentOptions, setStudentOptions] = useState<StudentOption[]>([]);
    const [selectedStudentId, setSelectedStudentId] = useState('');
    const [studentLoading, setStudentLoading] = useState(false);

    const [selectedHomeworkId, setSelectedHomeworkId] = useState<number | null>(null);
    const [statusTab, setStatusTab] = useState<HomeworkStatusTab>('PENDING');
    const [statusLoading, setStatusLoading] = useState(false);
    const [statusData, setStatusData] = useState<StatusRow[]>([]);
    const [gradeDrafts, setGradeDrafts] = useState<Record<number, { score: string; comment: string; resultId?: number }>>({});
    const [gradingLoading, setGradingLoading] = useState<Record<number, boolean>>({});

    const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
    const [attendanceData, setAttendanceData] = useState<any[]>([]);
    const [attendanceDraft, setAttendanceDraft] = useState<Record<number, boolean | null>>({});
    const [attendanceLoading, setAttendanceLoading] = useState(false);
    const [attendanceSaved, setAttendanceSaved] = useState(false);
    const [savingAttendance, setSavingAttendance] = useState(false);
    const [topic, setTopic] = useState('');

    const lessonById = useMemo(() => {
        return lessons.reduce<Record<number, Lesson>>((acc, lesson) => {
            acc[lesson.id] = lesson;
            return acc;
        }, {});
    }, [lessons]);

    const loadAll = async () => {
        if (!id) return;
        setLoading(true);
        setError('');
        try {
            const [groupRes, lessonRes, homeworkRes, videoRes] = await Promise.all([
                groupsApi.getById(id),
                lessonsApi.list(id),
                homeworkApi.list(id),
                videosApi.list(id),
            ]);
            setGroup(groupRes?.data || groupRes || null);
            setLessons(lessonRes?.data || lessonRes || []);
            setHomeworks(homeworkRes?.data || homeworkRes || []);
            setVideos(videoRes?.data || videoRes || []);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Ma'lumotlarni yuklashda xatolik");
            setGroup(null);
        } finally {
            setLoading(false);
        }
    };

    const loadGroup = async () => {
        if (!id) return;
        try {
            const res = await groupsApi.getById(id);
            setGroup(res?.data || res || null);
        } catch {
            setError("Guruh ma'lumotlarini yangilashda xatolik");
        }
    };

    useEffect(() => {
        if (group?.name) {
            setEditName(group.name);
        }
    }, [group?.name]);

    const loadTeacherOptions = async () => {
        try {
            const res = await api.get('/teachers/all');
            const list = res?.data?.data || res?.data || [];
            setTeacherOptions(list.map((teacher: any) => ({ id: String(teacher.id), fullName: teacher.fullName })));
        } catch {
            setTeacherOptions([]);
        }
    };

    const loadStudentOptions = async () => {
        try {
            const res = await api.get('/students/all?status=ACTIVE');
            const list = res?.data?.data || res?.data || [];
            const groupStudentIds = new Set((group?.students || []).map((student) => Number(student.id)));
            setStudentOptions(
                list
                    .filter((student: any) => !groupStudentIds.has(Number(student.id)))
                    .map((student: any) => ({
                        id: Number(student.id),
                        fullName: student.fullName,
                        email: student.email,
                    })),
            );
        } catch {
            setStudentOptions([]);
        }
    };

    const handleCreateLesson = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!id || !lessonForm.title.trim()) return;
        setLessonLoading(true);
        try {
            await lessonsApi.create({ groupId: Number(id), title: lessonForm.title.trim() });
            const lessonRes = await lessonsApi.list(id);
            setLessons(lessonRes?.data || lessonRes || []);
            setLessonForm({ title: '' });
        } catch (err: any) {
            setError(err?.response?.data?.message || "Dars yaratishda xatolik");
        } finally {
            setLessonLoading(false);
        }
    };

    const openTeacherForm = async () => {
        setError('');
        setSelectedTeacherId('');
        setShowTeacherForm(true);
        await loadTeacherOptions();
    };

    const handleAssignTeacher = async () => {
        if (!id || !selectedTeacherId) return;
        setTeacherLoading(true);
        setError('');
        try {
            await groupsApi.update(id, { teacherId: Number(selectedTeacherId) });
            setShowTeacherForm(false);
            setSelectedTeacherId('');
            await loadGroup();
        } catch (err: any) {
            const message = err?.response?.data?.message;
            setError(Array.isArray(message) ? message.join(', ') : message || "O'qituvchi qo'shishda xatolik");
        } finally {
            setTeacherLoading(false);
        }
    };

    const openStudentForm = async () => {
        setError('');
        setSelectedStudentId('');
        setShowStudentForm(true);
        await loadStudentOptions();
    };

    const handleEditGroup = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!id || !editName.trim()) return;
        setEditLoading(true);
        setError('');
        try {
            await groupsApi.update(id, { name: editName.trim() });
            setShowEditForm(false);
            await loadAll();
        } catch (err: any) {
            const message = err?.response?.data?.message;
            setError(Array.isArray(message) ? message.join(', ') : message || 'Tahrirlashda xatolik');
        } finally {
            setEditLoading(false);
        }
    };

    const handleAssignStudent = async () => {
        if (!id || !selectedStudentId) return;
        setStudentLoading(true);
        setError('');
        try {
            await studentGroupApi.addStudent({ groupId: Number(id), studentId: Number(selectedStudentId) });
            setShowStudentForm(false);
            setSelectedStudentId('');
            await loadGroup();
            await loadStudentOptions();
        } catch (err: any) {
            const message = err?.response?.data?.message;
            setError(Array.isArray(message) ? message.join(', ') : message || "O'quvchi qo'shishda xatolik");
        } finally {
            setStudentLoading(false);
        }
    };

    const handleCreateHomework = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!id || !homeworkForm.title.trim() || !homeworkForm.lessonId) return;
        setHomeworkLoading(true);
        try {
            await homeworkApi.create({
                groupId: Number(id),
                lessonId: Number(homeworkForm.lessonId),
                title: homeworkForm.title.trim(),
                file: homeworkForm.file,
            });
            const homeworkRes = await homeworkApi.list(id);
            setHomeworks(homeworkRes?.data || homeworkRes || []);
            setHomeworkForm({ lessonId: '', title: '', file: null });
            setShowHomeworkForm(false);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Uyga vazifa qo'shishda xatolik");
        } finally {
            setHomeworkLoading(false);
        }
    };

    const handleUploadVideo = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!id || !videoForm.lessonId || !videoForm.file) return;
        setVideoLoading(true);
        try {
            await videosApi.upload({
                groupId: Number(id),
                lessonId: Number(videoForm.lessonId),
                file: videoForm.file,
            });
            const videoRes = await videosApi.list(id);
            setVideos(videoRes?.data || videoRes || []);
            setVideoForm({ lessonId: '', file: null });
            setShowVideoForm(false);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Video yuklashda xatolik");
        } finally {
            setVideoLoading(false);
        }
    };

    const loadStatus = async (homeworkId: number, status: HomeworkStatusTab) => {
        setStatusLoading(true);
        try {
            const res = await homeworkApi.getByStatus(homeworkId, status);
            setStatusData(res?.data || res || []);
        } catch (err: any) {
            setError(err?.response?.data?.message || "Uyga vazifa holatini olishda xatolik");
            setStatusData([]);
        } finally {
            setStatusLoading(false);
        }
    };

    const getDeadline = (item: Homework | undefined) => {
        if (!item?.created_at || !item.durationTime) return '-';
        const created = new Date(item.created_at);
        const deadline = new Date(created.getTime() + item.durationTime * 60 * 1000);
        return formatDateTime(deadline.toISOString());
    };

    const handleToggleAttendance = (studentId: number) => {
        setAttendanceDraft((prev) => {
            const current = prev[studentId];
            const nextValue = current === null || current === undefined ? true : !current;
            return { ...prev, [studentId]: nextValue };
        });
    };

    const handleSaveAttendance = async () => {
        if (!selectedLesson || !topic.trim() || !group?.students?.length) return;
        const isReady = group.students.every((student) => {
            const value = attendanceDraft[Number(student.id)];
            return value === true || value === false;
        });
        if (!isReady) return;

        setSavingAttendance(true);
        try {
            await Promise.all(
                group.students.map((student) =>
                    attendanceApi.create({
                        lessonId: selectedLesson.id,
                        studentId: Number(student.id),
                        isPresent: Boolean(attendanceDraft[Number(student.id)]),
                    }),
                ),
            );
            const res = await attendanceApi.getByLesson(selectedLesson.id);
            setAttendanceData(res?.data || res || []);
            setAttendanceSaved(true);
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Davomatni saqlashda xatolik');
        } finally {
            setSavingAttendance(false);
        }
    };

    useEffect(() => {
        loadAll();
    }, [id]);

    useEffect(() => {
        if (!selectedHomeworkId) return;
        loadStatus(selectedHomeworkId, statusTab);
    }, [selectedHomeworkId, statusTab]);

    useEffect(() => {
        const drafts: Record<number, { score: string; comment: string; resultId?: number }> = {};
        statusData.forEach((row) => {
            const studentId = row?.student?.id ?? row?.id;
            if (!studentId) return;
            drafts[studentId] = {
                score: row?.score !== undefined && row?.score !== null ? String(row.score) : '',
                comment: row?.teacherComment || '',
                resultId: row?.resultId,
            };
        });
        setGradeDrafts(drafts);
    }, [statusData, statusTab]);

    useEffect(() => {
        if (!selectedLesson) return;
        setAttendanceLoading(true);
        attendanceApi.getByLesson(selectedLesson.id)
            .then((res) => setAttendanceData(res?.data || res || []))
            .catch(() => setAttendanceData([]))
            .finally(() => setAttendanceLoading(false));
    }, [selectedLesson]);

    useEffect(() => {
        if (!selectedLesson) {
            setTopic('');
            setAttendanceSaved(false);
            return;
        }
        setTopic(cleanLessonTitle(selectedLesson.title) || '');
        setAttendanceSaved(attendanceData.length > 0);
    }, [selectedLesson, attendanceData.length]);

    useEffect(() => {
        if (!selectedLesson || !group?.students?.length) {
            setAttendanceDraft({});
            setAttendanceSaved(false);
            return;
        }
        const nextDraft: Record<number, boolean | null> = {};
        group.students.forEach((student) => {
            const record = attendanceData.find((a) => String(a.student.id) === student.id);
            nextDraft[Number(student.id)] = record ? record.isPresent : null;
        });
        setAttendanceDraft(nextDraft);
        setAttendanceSaved(attendanceData.length > 0);
    }, [selectedLesson, attendanceData, group?.students]);

    if (loading) {
        return <div className="py-12 text-center text-slate-400">Yuklanmoqda...</div>;
    }

    if (!group) {
        return (
            <div className="space-y-3">
                <button
                    onClick={() => navigate('/admin/groups')}
                    className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                >
                    Orqaga
                </button>
                <p className="text-slate-500">Guruh topilmadi</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex flex-wrap items-center justify-between gap-4">
                    <div>
                        <button
                            onClick={() => navigate('/admin/groups')}
                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
                        >
                            Orqaga
                        </button>
                        <div className="mt-2 flex items-center gap-3">
                            <h1 className="text-2xl font-semibold text-slate-900">{group.name}</h1>
                            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Faol</span>
                        </div>
                        <p className="mt-1 text-sm text-slate-500">Kurs bo'yicha umumiy ma'lumot va monitoring.</p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <button className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition hover:bg-emerald-100">
                            Statistika
                        </button>
                        <button
                            onClick={() => setShowEditForm(true)}
                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
                        >
                            <Pencil size={14} /> Tahrirlash
                        </button>
                        <button
                            onClick={openTeacherForm}
                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
                        >
                            <Plus size={14} /> O'qituvchi qo'shish
                        </button>
                        <button
                            onClick={openStudentForm}
                            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-200 hover:text-emerald-700"
                        >
                            <Plus size={14} /> O'quvchi qo'shish
                        </button>
                        <button className="rounded-full bg-rose-500 p-3 text-white transition hover:bg-rose-600">
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            </div>

            <div className="flex flex-wrap gap-2">
                <button
                    onClick={() => setTab('info')}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${tab === 'info'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'border border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-700'
                        }`}
                >
                    Ma'lumotlar
                </button>
                <button
                    onClick={() => setTab('lessons')}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${tab === 'lessons'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'border border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-700'
                        }`}
                >
                    Guruh darsliklari
                </button>
                <button
                    onClick={() => setTab('attendance')}
                    className={`rounded-full px-4 py-2 text-sm font-semibold transition ${tab === 'attendance'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'border border-slate-200 bg-white text-slate-600 hover:border-emerald-200 hover:text-emerald-700'
                        }`}
                >
                    Akademik davomat
                </button>
            </div>

            {error && <div className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</div>}

            {tab === 'info' && (
                <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
                    <div className="rounded-3xl border border-slate-200 bg-white p-6">
                        <h3 className="text-lg font-semibold text-slate-800">Guruh ma'lumotlari</h3>
                        <div className="mt-4 space-y-3 text-sm text-slate-600">
                            <div className="flex items-center justify-between">
                                <span>Kurs</span>
                                <span className="font-medium text-slate-800">{group.courseName}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Dars vaqti</span>
                                <span className="font-medium text-slate-800">{group.lessonTime}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Dars davomiyligi</span>
                                <span className="font-medium text-slate-800">{group.lessonDurationMinutes || 0} min</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>Filial</span>
                                <span className="font-medium text-slate-800">{group.roomName || '-'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span>O'qituvchi</span>
                                <span className="font-medium text-slate-800">{group.teachers?.[0]?.fullName || '-'}</span>
                            </div>
                            <div className="flex items-start justify-between">
                                <span>Dars kunlari</span>
                                <span className="text-right font-medium text-slate-800">
                                    {(group.lessonDays || []).map((day) => weekdayLabel[day] || day).join(', ') || '-'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-3xl border border-slate-200 bg-white p-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-800">Talabalar</h3>
                            <span className="rounded-full bg-slate-900 px-3 py-1 text-xs text-white">
                                {group.students?.length || 0} ta
                            </span>
                        </div>
                        <div className="mt-4 space-y-3">
                            {(group.students || []).map((student) => (
                                <div key={student.id} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
                                    {student.photo ? (
                                        <img src={student.photo} className="h-8 w-8 rounded-full object-cover" />
                                    ) : (
                                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-600">
                                            {student.fullName?.[0] || 'U'}
                                        </div>
                                    )}
                                    <div>
                                        <p className="text-sm font-medium text-slate-800">{student.fullName}</p>
                                        <p className="text-xs text-slate-400">Faol</p>
                                    </div>
                                </div>
                            ))}
                            {(group.students || []).length === 0 && (
                                <p className="text-sm text-slate-400">Talabalar yo'q</p>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {tab === 'lessons' && (
                <div className="space-y-5">
                    <div className="flex flex-wrap items-center gap-2">
                        {(
                            [
                                { key: 'lessons', label: 'Darsliklar' },
                                { key: 'homeworks', label: 'Uyga vazifa' },
                                { key: 'videos', label: 'Videolar' },
                                { key: 'exams', label: 'Imtihonlar' },
                                { key: 'journal', label: 'Jurnal' },
                            ] as const
                        ).map((item) => (
                            <button
                                key={item.key}
                                onClick={() => setSubTab(item.key)}
                                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${subTab === item.key
                                    ? 'bg-slate-900 text-white shadow-sm'
                                    : 'border border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                                    }`}
                            >
                                {item.label}
                            </button>
                        ))}
                    </div>

                    {subTab === 'lessons' && (
                        <div className="rounded-3xl border border-slate-200 bg-white p-6">
                            <h3 className="text-lg font-semibold text-slate-800">Yangi dars yaratish</h3>
                            <form onSubmit={handleCreateLesson} className="mt-4 space-y-4">
                                <div>
                                    <label className="mb-2 block text-sm font-medium text-slate-600">Mavzu</label>
                                    <input
                                        className="w-full rounded-2xl border border-slate-200 px-4 py-2 text-sm"
                                        placeholder="Mavzuni kiriting"
                                        value={lessonForm.title}
                                        onChange={(e) => setLessonForm({ title: e.target.value })}
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={lessonLoading}
                                        className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white transition disabled:opacity-50"
                                    >
                                        {lessonLoading ? 'Saqlanmoqda...' : 'Saqlash'}
                                    </button>
                                </div>
                            </form>
                            {lessons.length > 0 && (
                                <div className="mt-5">
                                    <h4 className="text-sm font-semibold text-slate-500">Yaratilgan darslar</h4>
                                    <div className="mt-3 space-y-2">
                                        {lessons.map((lesson, index) => (
                                            <div key={lesson.id} className="flex items-center gap-3 rounded-2xl bg-slate-50 px-4 py-2 text-sm">
                                                <span className="text-slate-400">{index + 1}.</span>
                                                <span className="font-medium text-slate-800">{cleanLessonTitle(lesson.title)}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {subTab === 'homeworks' && (
                        <button
                            onClick={() => setShowHomeworkForm(true)}
                            className="ml-auto rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                        >
                            Uyga vazifa qo'shish
                        </button>
                    )}

                    {subTab === 'videos' && (
                        <button
                            onClick={() => setShowVideoForm(true)}
                            className="ml-auto rounded-full bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
                        >
                            Qo'shish
                        </button>
                    )}

                    {subTab === 'homeworks' && (
                        <div className="rounded-3xl border border-slate-200 bg-white">
                            <table className="min-w-full text-left text-sm">
                                <thead>
                                    <tr className="border-b text-slate-400">
                                        <th className="px-4 py-3">#</th>
                                        <th className="px-4 py-3">Mavzu</th>
                                        <th className="px-4 py-3 text-center">Kutayotgan</th>
                                        <th className="px-4 py-3 text-center">Qaytarilgan</th>
                                        <th className="px-4 py-3 text-center">Qabul qilingan</th>
                                        <th className="px-4 py-3">Berilgan vaqt</th>
                                        <th className="px-4 py-3">Tugash vaqti</th>
                                        <th className="px-4 py-3">Dars sanasi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {homeworks.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="px-4 py-8 text-center text-slate-400">
                                                Uyga vazifa mavjud emas
                                            </td>
                                        </tr>
                                    ) : (
                                        homeworks.map((item, index) => {
                                            const lesson = lessonById[item.lessonId];
                                            return (
                                                <tr
                                                    key={item.id}
                                                    className="cursor-pointer border-b hover:bg-slate-50"
                                                    onClick={() => setSelectedHomeworkId(item.id)}
                                                >
                                                    <td className="px-4 py-3 text-slate-500">{index + 1}</td>
                                                    <td className="px-4 py-3 font-medium text-slate-900">{item.title}</td>
                                                    <td className="px-4 py-3 text-center text-slate-500">-</td>
                                                    <td className="px-4 py-3 text-center text-slate-500">-</td>
                                                    <td className="px-4 py-3 text-center text-slate-500">-</td>
                                                    <td className="px-4 py-3 text-slate-500">
                                                        {item.created_at ? formatDate(item.created_at) : '-'}
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-500">{getDeadline(item)}</td>
                                                    <td className="px-4 py-3 text-slate-500">
                                                        {lesson?.created_at ? formatDate(lesson.created_at) : '-'}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {subTab === 'homeworks' && selectedHomeworkId && (
                        <div className="rounded-3xl border border-slate-200 bg-white p-6">
                            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                                <div>
                                    <p className="text-xs text-slate-500">Mavzu</p>
                                    <p className="text-lg font-semibold text-slate-800">
                                        {homeworks.find((h) => h.id === selectedHomeworkId)?.title || '-'}
                                    </p>
                                </div>
                                <div className="text-sm text-slate-500">
                                    Tugash vaqti: {getDeadline(homeworks.find((h) => h.id === selectedHomeworkId))}
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-2 border-b pb-3 text-sm">
                                {(Object.keys(statusLabels) as HomeworkStatusTab[]).map((key) => (
                                    <button
                                        key={key}
                                        onClick={() => setStatusTab(key)}
                                        className={`rounded-full px-3 py-1 text-xs font-medium ${statusTab === key
                                            ? 'bg-slate-900 text-white'
                                            : 'border border-slate-200 text-slate-500 hover:bg-slate-50'
                                            }`}
                                    >
                                        {statusLabels[key]}
                                    </button>
                                ))}
                            </div>

                            <div className="mt-4">
                                {statusLoading ? (
                                    <div className="py-6 text-center text-slate-400">Yuklanmoqda...</div>
                                ) : statusData.length === 0 ? (
                                    <div className="py-8 text-center text-slate-400">Ma'lumot topilmadi</div>
                                ) : (
                                    <table className="min-w-full text-left text-sm">
                                        <thead>
                                            <tr className="border-b text-slate-400">
                                                <th className="py-3">O'quvchi</th>
                                                <th className="py-3">Fayl</th>
                                                <th className="py-3">Izoh</th>
                                                <th className="py-3">Yuborilgan</th>
                                                <th className="py-3">Ball</th>
                                                <th className="py-3">Teacher izoh</th>
                                                <th className="py-3">Amal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {statusData.map((row, index) => {
                                                const student = row?.student || { id: row?.id, fullName: row?.fullName };
                                                const studentId = Number(student.id);
                                                const studentName = student.fullName || '-';
                                                if (!studentId) {
                                                    return (
                                                        <tr key={index} className="border-b">
                                                            <td className="py-3 text-slate-700">{studentName}</td>
                                                            <td className="py-3 text-slate-500" colSpan={6}>-</td>
                                                        </tr>
                                                    );
                                                }
                                                const draft = gradeDrafts[studentId] || { score: '', comment: '', resultId: row?.resultId };
                                                const isNotReviewed = statusTab === 'NOT_REVIEWED';
                                                const isSaving = gradingLoading[studentId];
                                                return (
                                                    <tr key={index} className="border-b align-top">
                                                        <td className="py-3 text-slate-700">{studentName}</td>
                                                        <td className="py-3 text-slate-500">
                                                            {row?.file ? (
                                                                <a className="text-slate-900 underline" href={row.file} target="_blank" rel="noreferrer">
                                                                    Fayl
                                                                </a>
                                                            ) : (
                                                                '-'
                                                            )}
                                                        </td>
                                                        <td className="py-3 text-slate-500">{row?.comment || '-'}</td>
                                                        <td className="py-3 text-slate-500">
                                                            {row?.submittedAt ? formatDateTime(row.submittedAt) : '-'}
                                                        </td>
                                                        <td className="py-3 text-slate-500">
                                                            {isNotReviewed ? (
                                                                '-'
                                                            ) : (
                                                                <input
                                                                    className="w-20 rounded-lg border px-2 py-1 text-sm"
                                                                    type="number"
                                                                    min={0}
                                                                    max={100}
                                                                    value={draft.score}
                                                                    onChange={(e) =>
                                                                        setGradeDrafts((prev) => ({
                                                                            ...prev,
                                                                            [studentId]: { ...draft, score: e.target.value },
                                                                        }))
                                                                    }
                                                                />
                                                            )}
                                                        </td>
                                                        <td className="py-3 text-slate-500">
                                                            {isNotReviewed ? (
                                                                'Bajarmagan'
                                                            ) : (
                                                                <input
                                                                    className="w-48 rounded-lg border px-2 py-1 text-sm"
                                                                    value={draft.comment}
                                                                    onChange={(e) =>
                                                                        setGradeDrafts((prev) => ({
                                                                            ...prev,
                                                                            [studentId]: { ...draft, comment: e.target.value },
                                                                        }))
                                                                    }
                                                                    placeholder="Izoh yozing"
                                                                />
                                                            )}
                                                        </td>
                                                        <td className="py-3 text-slate-500">
                                                            {isNotReviewed ? (
                                                                '-'
                                                            ) : (
                                                                <button
                                                                    disabled={isSaving || !draft.score}
                                                                    onClick={async () => {
                                                                        if (!selectedHomeworkId) return;
                                                                        setGradingLoading((prev) => ({ ...prev, [studentId]: true }));
                                                                        try {
                                                                            const payload = {
                                                                                homeworkId: selectedHomeworkId,
                                                                                studentId,
                                                                                score: Number(draft.score),
                                                                                title: draft.comment || '-',
                                                                            };
                                                                            if (draft.resultId) {
                                                                                await homeworkApi.updateResult(draft.resultId, payload);
                                                                            } else {
                                                                                await homeworkApi.createResult(payload);
                                                                            }
                                                                            await loadStatus(selectedHomeworkId, statusTab);
                                                                        } finally {
                                                                            setGradingLoading((prev) => ({ ...prev, [studentId]: false }));
                                                                        }
                                                                    }}
                                                                    className="rounded-lg bg-slate-900 px-3 py-1 text-xs text-white disabled:opacity-50"
                                                                >
                                                                    {isSaving ? 'Saqlanmoqda' : 'Saqlash'}
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>
                    )}

                    {subTab === 'videos' && (
                        <div className="rounded-3xl border border-slate-200 bg-white">
                            <table className="min-w-full table-fixed text-left text-sm">
                                <thead>
                                    <tr className="border-b text-slate-400">
                                        <th className="w-[34%] px-4 py-3">Video nomi</th>
                                        <th className="w-[18%] px-4 py-3">Dars nomi</th>
                                        <th className="w-[10%] px-4 py-3">Status</th>
                                        <th className="w-[12%] px-4 py-3">Dars sanasi</th>
                                        <th className="w-[8%] px-4 py-3">Hajmi</th>
                                        <th className="w-[18%] px-4 py-3">Qo'shilgan vaqt</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {videos.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="px-4 py-8 text-center text-slate-400">Video mavjud emas</td>
                                        </tr>
                                    ) : (
                                        videos.map((video) => {
                                            const lesson = lessonById[video.lessonId];
                                            const rawName = video.file?.split('/').pop() || `Video ${video.id}`;
                                            const cleanName = rawName.split('?')[0];
                                            return (
                                                <tr key={video.id} className="border-b">
                                                    <td className="px-4 py-3 text-slate-700">
                                                        <span className="block truncate" title={cleanName}>{cleanName}</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-500">
                                                        <span className="block truncate" title={lesson?.title || '-'}>{lesson?.title || '-'}</span>
                                                    </td>
                                                    <td className="px-4 py-3">
                                                        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs text-white">Tayyor</span>
                                                    </td>
                                                    <td className="px-4 py-3 text-slate-500">{lesson?.created_at ? formatDate(lesson.created_at) : '-'}</td>
                                                    <td className="px-4 py-3 text-slate-500">-</td>
                                                    <td className="px-4 py-3 text-slate-500">{video.created_at ? formatDate(video.created_at) : '-'}</td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {subTab === 'exams' && (
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
                            Imtihonlar bo'limi hozircha bo'sh.
                        </div>
                    )}

                    {subTab === 'journal' && (
                        <div className="rounded-3xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
                            Jurnal bo'limi hozircha bo'sh.
                        </div>
                    )}
                </div>
            )}

            {tab === 'attendance' && (
                <div className="space-y-6">
                    <div className="glass-panel rounded-3xl border border-white/80 bg-white/85 p-5 shadow-sm backdrop-blur">
                        <div className="grid gap-6 lg:grid-cols-[1fr_240px]">
                            <div className="space-y-4">
                                <div className="flex flex-wrap items-center gap-2">
                                    <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                        Akademik davomat paneli
                                    </span>
                                    <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                                        {lessons.length} ta dars
                                    </span>
                                </div>
                                <div>
                                    <p className="text-sm text-slate-400">Ma'lumot</p>
                                    <div className="mt-3 flex items-center gap-3">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
                                            <span className="text-lg font-semibold">{group.teachers?.[0]?.fullName?.[0] || 'U'}</span>
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-slate-800">{group.teachers?.[0]?.fullName || '-'}</p>
                                            <p className="text-xs text-slate-400">Teacher</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid gap-4 sm:grid-cols-2">
                                    <div>
                                        <p className="text-xs text-slate-400">Dars kuni</p>
                                        <select
                                            className="mt-2 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100"
                                            value={selectedLesson?.id || ''}
                                            onChange={(e) => {
                                                const lesson = lessons.find((l) => l.id === Number(e.target.value));
                                                setSelectedLesson(lesson || null);
                                            }}
                                        >
                                            <option value="">Darsni tanlang</option>
                                            {lessons.map((lesson) => (
                                                <option key={lesson.id} value={lesson.id}>
                                                    {formatDateTime(lesson.created_at)} • {cleanLessonTitle(lesson.title)}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400">Dars vaqti</p>
                                        <div className="mt-2 rounded-xl border px-3 py-2 text-sm text-slate-700">
                                            {group.lessonTime}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400">Filial</p>
                                        <div className="mt-2 rounded-xl border px-3 py-2 text-sm text-slate-700">
                                            {group.roomName || '-'}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-xs text-slate-400">Kurs</p>
                                        <div className="mt-2 rounded-xl border px-3 py-2 text-sm text-slate-700">
                                            {group.courseName}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="rounded-2xl border border-dashed border-sky-200 bg-gradient-to-br from-sky-50 to-cyan-50 p-4 text-sm text-slate-500">
                                <p className="font-semibold text-slate-700">Eslatma</p>
                                <p className="mt-2">Dars mavzusini kiriting va davomatni belgilang. Saqlash mavzu to'ldirilganda faol bo'ladi.</p>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel rounded-3xl border border-white/80 bg-white/90 p-5 shadow-sm backdrop-blur">
                        <div className="mb-5">
                            <h3 className="text-lg font-semibold text-slate-800">Yo'qlama va mavzu kiritish</h3>
                            <p className="text-sm text-slate-500">Dars mavzusini yozing va davomatni to'ldiring</p>
                        </div>

                        <div className="mb-6">
                            <label className="mb-2 block text-sm font-medium text-slate-600">Mavzu</label>
                            <input
                                className="w-full rounded-xl border px-4 py-3 text-sm outline-none focus:border-violet-400"
                                placeholder="Dars mavzusini yozing"
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                            />
                        </div>

                        {!selectedLesson && (
                            <div className="py-12 text-center text-slate-400">Davomat ko'rish uchun dars tanlang</div>
                        )}

                        {selectedLesson && (
                            attendanceLoading ? (
                                <div className="py-8 text-center text-slate-400">Yuklanmoqda...</div>
                            ) : (
                                <div className="space-y-4">
                                    <div className="rounded-xl border border-slate-100">
                                        <div className="grid grid-cols-[1fr_120px_120px] border-b bg-slate-50 px-4 py-3 text-xs font-medium text-slate-500">
                                            <span>O'quvchi ismi</span>
                                            <span>Vaqti</span>
                                            <span className="text-center">Keldi</span>
                                        </div>
                                        <div className="divide-y">
                                            {group.students?.map((student) => {
                                                const currentValue = attendanceDraft[Number(student.id)];
                                                return (
                                                    <div key={student.id} className="grid grid-cols-[1fr_120px_120px] items-center px-4 py-3">
                                                        <div className="flex items-center gap-3">
                                                            {student.photo
                                                                ? <img src={student.photo} className="h-8 w-8 rounded-full object-cover" />
                                                                : <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-600">{student.fullName?.[0]}</div>
                                                            }
                                                            <div>
                                                                <p className="text-sm font-medium text-slate-800">{student.fullName}</p>
                                                                <p className="text-xs text-slate-400">Faol</p>
                                                            </div>
                                                        </div>
                                                        <div className="text-sm text-slate-500">{group.lessonTime}</div>
                                                        <div className="flex justify-center">
                                                            <button
                                                                onClick={() => handleToggleAttendance(Number(student.id))}
                                                                className={`h-6 w-12 rounded-full border px-1 transition ${currentValue === true ? 'border-emerald-400 bg-emerald-100' : currentValue === false ? 'border-rose-200 bg-rose-50' : 'border-slate-200 bg-slate-100'}`}
                                                                aria-label="Davomatni belgilash"
                                                            >
                                                                <span
                                                                    className={`block h-4 w-4 rounded-full transition ${currentValue === true ? 'translate-x-6 bg-emerald-500' : currentValue === false ? 'translate-x-0 bg-rose-500' : 'translate-x-0 bg-slate-400'}`}
                                                                />
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <button
                                            onClick={handleSaveAttendance}
                                            disabled={attendanceSaved || !selectedLesson || !topic.trim() || savingAttendance || group.students?.some((student) => {
                                                const value = attendanceDraft[Number(student.id)];
                                                return value !== true && value !== false;
                                            })}
                                            className="rounded-xl bg-violet-600 px-6 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {savingAttendance ? 'Saqlanmoqda...' : 'Saqlash'}
                                        </button>
                                    </div>
                                </div>
                            )
                        )}
                    </div>
                </div>
            )}

            {showEditForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
                    <form
                        onSubmit={handleEditGroup}
                        className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-800">Guruhni tahrirlash</h3>
                            <button
                                type="button"
                                onClick={() => setShowEditForm(false)}
                                className="text-slate-500"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-600">Guruh nomi</label>
                                <input
                                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                                    value={editName}
                                    onChange={(e) => setEditName(e.target.value)}
                                    placeholder="Guruh nomini kiriting"
                                />
                            </div>
                        </div>

                        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowEditForm(false)}
                                className="rounded-full border border-slate-200 px-4 py-2 text-sm"
                            >
                                Bekor qilish
                            </button>
                            <button
                                type="submit"
                                disabled={editLoading || !editName.trim()}
                                className="rounded-full bg-emerald-600 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {editLoading ? 'Saqlanmoqda...' : 'Saqlash'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {showTeacherForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
                    <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-800">O'qituvchi qo'shish</h3>
                            <button
                                type="button"
                                onClick={() => setShowTeacherForm(false)}
                                className="text-slate-500"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-600">O'qituvchi</label>
                                <select
                                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                                    value={selectedTeacherId}
                                    onChange={(e) => setSelectedTeacherId(e.target.value)}
                                >
                                    <option value="">O'qituvchini tanlang</option>
                                    {teacherOptions.map((teacher) => (
                                        <option key={teacher.id} value={teacher.id}>
                                            {teacher.fullName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowTeacherForm(false)}
                                className="rounded-full border border-slate-200 px-4 py-2 text-sm"
                            >
                                Bekor qilish
                            </button>
                            <button
                                type="button"
                                onClick={handleAssignTeacher}
                                disabled={teacherLoading || !selectedTeacherId}
                                className="rounded-full bg-emerald-600 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {teacherLoading ? "Qo'shilmoqda..." : "Qo'shish"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showStudentForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
                    <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-800">O'quvchi qo'shish</h3>
                            <button
                                type="button"
                                onClick={() => setShowStudentForm(false)}
                                className="text-slate-500"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-600">O'quvchi</label>
                                <select
                                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                                    value={selectedStudentId}
                                    onChange={(e) => setSelectedStudentId(e.target.value)}
                                >
                                    <option value="">O'quvchini tanlang</option>
                                    {studentOptions.map((student) => (
                                        <option key={student.id} value={student.id}>
                                            {student.fullName}{student.email ? ` — ${student.email}` : ''}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowStudentForm(false)}
                                className="rounded-full border border-slate-200 px-4 py-2 text-sm"
                            >
                                Bekor qilish
                            </button>
                            <button
                                type="button"
                                onClick={handleAssignStudent}
                                disabled={studentLoading || !selectedStudentId}
                                className="rounded-full bg-indigo-600 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {studentLoading ? "Qo'shilmoqda..." : "Qo'shish"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {showHomeworkForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
                    <form
                        onSubmit={handleCreateHomework}
                        className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-800">Uyga vazifa yuklash</h3>
                            <button
                                type="button"
                                onClick={() => setShowHomeworkForm(false)}
                                className="text-slate-500"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-600">Dars</label>
                                <select
                                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                                    value={homeworkForm.lessonId}
                                    onChange={(e) => setHomeworkForm((prev) => ({ ...prev, lessonId: e.target.value }))}
                                >
                                    <option value="">Darsni tanlang</option>
                                    {lessons.map((lesson) => (
                                        <option key={lesson.id} value={lesson.id}>
                                            {cleanLessonTitle(lesson.title)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-600">Mavzu</label>
                                <input
                                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                                    placeholder="Uyga vazifa mavzusini yozing"
                                    value={homeworkForm.title}
                                    onChange={(e) => setHomeworkForm((prev) => ({ ...prev, title: e.target.value }))}
                                />
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-600">Fayl</label>
                                <input
                                    type="file"
                                    onChange={(e) =>
                                        setHomeworkForm((prev) => ({
                                            ...prev,
                                            file: e.target.files?.[0] || null,
                                        }))
                                    }
                                    className="block w-full text-sm text-slate-600"
                                />
                            </div>
                        </div>

                        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowHomeworkForm(false)}
                                className="rounded-full border border-slate-200 px-4 py-2 text-sm"
                            >
                                Bekor qilish
                            </button>
                            <button
                                type="submit"
                                disabled={homeworkLoading || !homeworkForm.title.trim() || !homeworkForm.lessonId}
                                className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {homeworkLoading ? 'Yuklanmoqda...' : 'Saqlash'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {showVideoForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-4">
                    <form
                        onSubmit={handleUploadVideo}
                        className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-2xl"
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-semibold text-slate-800">Video yuklash</h3>
                            <button
                                type="button"
                                onClick={() => setShowVideoForm(false)}
                                className="text-slate-500"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-600">Dars</label>
                                <select
                                    className="w-full rounded-2xl border border-slate-200 px-3 py-2 text-sm"
                                    value={videoForm.lessonId}
                                    onChange={(e) => setVideoForm((prev) => ({ ...prev, lessonId: e.target.value }))}
                                >
                                    <option value="">Darsni tanlang</option>
                                    {lessons.map((lesson) => (
                                        <option key={lesson.id} value={lesson.id}>
                                            {cleanLessonTitle(lesson.title)}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="mb-2 block text-sm font-medium text-slate-600">Video fayl</label>
                                <input
                                    type="file"
                                    accept="video/*"
                                    onChange={(e) =>
                                        setVideoForm((prev) => ({
                                            ...prev,
                                            file: e.target.files?.[0] || null,
                                        }))
                                    }
                                    className="block w-full text-sm text-slate-600"
                                />
                            </div>
                        </div>

                        {error && <p className="mt-4 text-sm text-red-500">{error}</p>}

                        <div className="mt-6 flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={() => setShowVideoForm(false)}
                                className="rounded-full border border-slate-200 px-4 py-2 text-sm"
                            >
                                Bekor qilish
                            </button>
                            <button
                                type="submit"
                                disabled={videoLoading || !videoForm.lessonId || !videoForm.file}
                                className="rounded-full bg-slate-900 px-4 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {videoLoading ? 'Yuklanmoqda...' : 'Yuklash'}
                            </button>
                        </div>
                    </form>
                </div>
            )}
        </div>
    );
};

export default GroupDetailsPage;
