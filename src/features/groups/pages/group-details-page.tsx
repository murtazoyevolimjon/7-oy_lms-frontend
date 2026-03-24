import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '@/api/axios';
import { groupsApi } from '@/api/groups.api';
import { lessonsApi } from '@/api/lesson.api';
import { homeworkApi } from '@/api/homework.api';
import { videosApi } from '@/api/videos.api';
import { attendanceApi } from '@/api/attendance.api';
import { studentGroupApi } from '@/api/students-group.api';
import { formatDate } from '@/lib/utils';
import { ArrowLeft, MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';

// ─── Types ───────────────────────────────────────────────
type Student = { id: string; fullName: string; photo?: string };
type Teacher = { id: string; fullName: string; phone?: string };
type GroupDetails = {
  id: string; name: string; courseName: string; courseId: string;
  roomId?: string; roomName?: string; price: number;
  lessonDays: string[]; lessonTime: string; startDate: string;
  lessonDurationMinutes: number; teachers: Teacher[]; students: Student[];
};
type Lesson = { id: number; title: string };
type Homework = { id: number; title: string; lessonId: number };
type Video = { id: number; file: string; lessonId: number; created_at: string };
type AttendanceRecord = { isPresent: boolean; student: { id: number; fullName: string; photo?: string } };
type AllStudent = { id: number; fullName: string; email: string };

const weekdayLabel: Record<string, string> = {
  MONDAY: 'Dushanba', TUESDAY: 'Seshanba', WEDNESDAY: 'Chorshanba',
  THURSDAY: 'Payshanba', FRIDAY: 'Juma', SATURDAY: 'Shanba', SUNDAY: 'Yakshanba',
};

export default function GroupDetailsPage() {
  const { id = '' } = useParams();
  const navigate = useNavigate();
  const numId = Number(id);

  const [group, setGroup] = useState<GroupDetails | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [homeworks, setHomeworks] = useState<Homework[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [mainTab, setMainTab] = useState<'info' | 'lessons' | 'attendance'>('info');
  const [lessonTab, setLessonTab] = useState<'homeworks' | 'videos'>('homeworks');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Lesson form
  const [lessonForm, setLessonForm] = useState({ title: '' });
  const [lessonLoading, setLessonLoading] = useState(false);

  // Homework form
  const [hwForm, setHwForm] = useState({ title: '', lessonId: '', file: null as File | null });
  const [hwLoading, setHwLoading] = useState(false);
  const [showHwForm, setShowHwForm] = useState(false);

  // Video form
  const [videoForm, setVideoForm] = useState({ lessonId: '', file: null as File | null });
  const [videoLoading, setVideoLoading] = useState(false);
  const [showVideoForm, setShowVideoForm] = useState(false); // ✅ alohida state

  // Attendance
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(false);

  // Add student modal
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [allStudents, setAllStudents] = useState<AllStudent[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [addStudentLoading, setAddStudentLoading] = useState(false);

  // ── Loaders ──
  const loadGroup = async () => {
    try {
      const res = await groupsApi.getById(id);
      setGroup(res?.data || res);
    } catch {
      setError("Guruh ma'lumotlarini yuklashda xatolik");
    }
  };

  const loadLessons = async () => {
    try {
      const res = await lessonsApi.list(id);
      setLessons(res?.data || res || []);
    } catch {
      setLessons([]);
    }
  };

  const loadHomeworks = async () => {
    try {
      const res = await homeworkApi.list(id);
      setHomeworks(res?.data || res || []);
    } catch {
      setHomeworks([]);
    }
  };

  const loadVideos = async () => {
    try {
      const res = await videosApi.list(id);
      setVideos(res?.data || res || []);
    } catch {
      setVideos([]);
    }
  };

  useEffect(() => {
    loadGroup();
    loadLessons();
    loadHomeworks();
    loadVideos();
  }, [id]);

  useEffect(() => {
    if (!selectedLesson) return;
    setAttendanceLoading(true);
    attendanceApi.getByLesson(selectedLesson.id)
      .then(res => setAttendanceData(res?.data || res || []))
      .catch(() => setAttendanceData([]))
      .finally(() => setAttendanceLoading(false));
  }, [selectedLesson]);

  // ── Handlers ──
  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lessonForm.title.trim()) return;
    setLessonLoading(true);
    setError('');
    try {
      await lessonsApi.create({ groupId: numId, title: lessonForm.title });
      setLessonForm({ title: '' });
      await loadLessons();
    } catch (err: any) {
      setError(err?.response?.data?.message || "Dars qo'shishda xatolik");
    } finally {
      setLessonLoading(false);
    }
  };

  const handleCreateHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hwForm.title.trim() || !hwForm.lessonId) return;
    setHwLoading(true);
    setError('');
    try {
      await homeworkApi.create({
        title: hwForm.title,
        groupId: numId,
        lessonId: Number(hwForm.lessonId),
        file: hwForm.file,
      });
      setHwForm({ title: '', lessonId: '', file: null });
      setShowHwForm(false);
      await loadHomeworks();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || "Vazifa qo'shishda xatolik");
    } finally {
      setHwLoading(false);
    }
  };

  // ✅ To'g'irlangan handleUploadVideo
  const handleUploadVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!videoForm.lessonId) {
      setError('Darsni tanlang');
      return;
    }
    if (!videoForm.file) {
      setError('Video faylni tanlang');
      return;
    }

    setVideoLoading(true);
    try {
      await videosApi.upload({
        groupId: numId,
        lessonId: Number(videoForm.lessonId),
        file: videoForm.file,
      });
      setVideoForm({ lessonId: '', file: null });
      setShowVideoForm(false); // ✅ formni yopish
      await loadVideos();
    } catch (err: any) {
      const msg = err?.response?.data?.message;
      setError(Array.isArray(msg) ? msg.join(', ') : msg || err?.message || 'Video yuklashda xatolik');
    } finally {
      setVideoLoading(false);
    }
  };

  const handleToggleAttendance = async (studentId: number, lessonId: number, current: boolean) => {
    try {
      await attendanceApi.create({ lessonId, studentId, isPresent: !current });
      const res = await attendanceApi.getByLesson(lessonId);
      setAttendanceData(res?.data || res || []);
    } catch (err: any) {
      alert(err?.response?.data?.message || 'Davomatni saqlashda xatolik');
    }
  };

  const loadAllStudents = async () => {
    const res = await api.get('/students/all').catch(() => ({ data: [] }));
    setAllStudents(res.data?.data || res.data || []);
  };

  const handleAddStudent = async () => {
    if (!selectedStudentId) return;
    setAddStudentLoading(true);
    setError('');
    try {
      await studentGroupApi.addStudent({ groupId: numId, studentId: Number(selectedStudentId) });
      setShowAddStudent(false);
      setSelectedStudentId('');
      await loadGroup();
    } catch (err: any) {
      setError(err?.response?.data?.message || "O'quvchi qo'shishda xatolik");
    } finally {
      setAddStudentLoading(false);
    }
  };

  if (!group) return (
    <div className="flex h-64 items-center justify-center text-slate-400">Yuklanmoqda...</div>
  );

  return (
    <div className="space-y-4">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/groups')}
            className="flex items-center gap-1 text-sm text-slate-500 hover:text-violet-600">
            <ArrowLeft size={16} /> Orqaga
          </button>
          <div>
            <h1 className="text-2xl font-bold">{group.name}</h1>
            <p className="text-sm text-slate-500">Guruh ma'lumotlari</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1 rounded-xl border px-4 py-2 text-sm hover:bg-slate-50">
            <Pencil size={14} /> Tahrirlash
          </button>
          <button
            onClick={() => { setShowAddStudent(true); loadAllStudents(); }}
            className="flex items-center gap-1 rounded-xl border px-4 py-2 text-sm hover:bg-slate-50">
            <Plus size={14} /> O'qituvchi qo'shish
          </button>
          <button
            onClick={() => { setShowAddStudent(true); loadAllStudents(); }}
            className="flex items-center gap-1 rounded-xl border px-4 py-2 text-sm hover:bg-slate-50">
            <Plus size={14} /> O'quvchi qo'shish
          </button>
          <button className="rounded-xl bg-red-500 p-2 text-white hover:bg-red-600">
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {error && <p className="rounded-xl bg-red-50 p-3 text-sm text-red-500">{error}</p>}

      {/* ── Tabs ── */}
      <div className="flex gap-1 border-b">
        {[
          { key: 'info', label: "Ma'lumotlar" },
          { key: 'lessons', label: 'Guruh darsliklari' },
          { key: 'attendance', label: 'Akademik davomat' },
        ].map((t) => (
          <button key={t.key} onClick={() => setMainTab(t.key as any)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              mainTab === t.key
                ? 'border-violet-600 text-violet-600'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* ══ MA'LUMOTLAR TAB ══ */}
      {mainTab === 'info' && (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="space-y-4">
            <div className="rounded-2xl border bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-bold">Ma'lumotlar</h2>
                <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs font-medium">{group.courseName}</span>
              </div>
              <div className="space-y-3 text-sm">
                <div><p className="text-slate-400">Kurs nomi</p><p className="font-medium">{group.courseName}</p></div>
                <div><p className="text-slate-400">Kurs to'lovi</p><p className="font-medium">{Number(group.price || 0).toLocaleString()} so'm</p></div>
                <div><p className="text-slate-400">O'tish kunlari</p><p className="font-medium">{group.lessonDays?.map(d => weekdayLabel[d] || d).join(', ')}</p></div>
                <div><p className="text-slate-400">O'tish vaqti</p><p className="font-medium">{group.lessonTime}</p></div>
                <div><p className="text-slate-400">O'qish davomiyligi</p><p className="font-medium">{group.lessonDurationMinutes} minut</p></div>
                <div><p className="text-slate-400">Xona</p><p className="font-medium">{group.roomName || '-'}</p></div>
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">O'qituvchilar</h3>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{group.teachers?.length} ta</span>
              </div>
              {group.teachers?.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-600">
                      {t.fullName?.[0]}
                    </div>
                    <p className="text-sm font-medium">{t.fullName}</p>
                  </div>
                  <button className="text-slate-400"><MoreHorizontal size={16} /></button>
                </div>
              ))}
            </div>

            <div className="rounded-2xl border bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">O'quvchilar</h3>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{group.students?.length} ta</span>
              </div>
              <div className="max-h-64 space-y-2 overflow-auto">
                {group.students?.map((s) => (
                  <div key={s.id} className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
                    <div className="flex items-center gap-2">
                      {s.photo
                        ? <img src={s.photo} className="h-8 w-8 rounded-full object-cover" />
                        : <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-600">{s.fullName?.[0]}</div>
                      }
                      <p className="text-sm font-medium">{s.fullName}</p>
                    </div>
                    <button className="text-slate-400"><MoreHorizontal size={16} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Yangi dars yaratish */}
          <div className="rounded-2xl border bg-white p-6">
            <h3 className="mb-4 text-lg font-bold">Yangi dars yaratish</h3>
            <form onSubmit={handleCreateLesson} className="space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium">* Mavzu</label>
                <input className="w-full rounded-xl border px-4 py-3 outline-none focus:border-violet-400"
                  placeholder="Mavzuni kiriting"
                  value={lessonForm.title}
                  onChange={(e) => setLessonForm({ title: e.target.value })} />
              </div>
              <div className="flex justify-end">
                <button type="submit" disabled={lessonLoading}
                  className="rounded-xl bg-violet-600 px-6 py-2 text-white disabled:opacity-50">
                  {lessonLoading ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>

            {lessons.length > 0 && (
              <div className="mt-6">
                <h4 className="mb-3 font-semibold text-sm text-slate-600">Yaratilgan darslar</h4>
                <div className="space-y-2">
                  {lessons.map((l, i) => (
                    <div key={l.id} className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-2 text-sm">
                      <span className="text-slate-400">{i + 1}.</span>
                      <span className="font-medium">{l.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══ GURUH DARSLIKLARI TAB ══ */}
      {mainTab === 'lessons' && (
        <div className="rounded-2xl border bg-white p-5">
          <div className="mb-4 flex items-center gap-3">
            <div className="flex gap-2">
              {(['homeworks', 'videos'] as const).map((t) => (
                <button key={t} onClick={() => { setLessonTab(t); setShowHwForm(false); setShowVideoForm(false); }}
                  className={`rounded-xl px-4 py-2 text-sm ${lessonTab === t ? 'bg-violet-600 text-white' : 'border hover:bg-slate-50'}`}>
                  {t === 'homeworks' ? 'Uyga vazifa' : 'Videolar'}
                </button>
              ))}
            </div>

            {/* ✅ Har bir tab uchun alohida toggle */}
            {lessonTab === 'homeworks' && (
              <button onClick={() => setShowHwForm(!showHwForm)}
                className="ml-auto rounded-xl bg-violet-600 px-4 py-2 text-sm text-white">
                + Uyga vazifa qo'shish
              </button>
            )}
            {lessonTab === 'videos' && (
              <button onClick={() => setShowVideoForm(!showVideoForm)}
                className="ml-auto rounded-xl bg-violet-600 px-4 py-2 text-sm text-white">
                + Video qo'shish
              </button>
            )}
          </div>

          {/* Homework form */}
          {showHwForm && lessonTab === 'homeworks' && (
            <form onSubmit={handleCreateHomework} className="mb-4 rounded-xl border p-4 space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Mavzu *</label>
                <input className="w-full rounded-xl border px-4 py-2 text-sm outline-none focus:border-violet-400"
                  placeholder="Vazifa mavzusi"
                  value={hwForm.title}
                  onChange={(e) => setHwForm({ ...hwForm, title: e.target.value })} />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Dars *</label>
                <select className="w-full rounded-xl border px-4 py-2 text-sm"
                  value={hwForm.lessonId}
                  onChange={(e) => setHwForm({ ...hwForm, lessonId: e.target.value })}>
                  <option value="">Darsni tanlang</option>
                  {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Fayl (ixtiyoriy)</label>
                <input type="file" onChange={(e) => setHwForm({ ...hwForm, file: e.target.files?.[0] || null })} />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowHwForm(false)}
                  className="rounded-xl border px-4 py-2 text-sm">Bekor qilish</button>
                <button type="submit" disabled={hwLoading}
                  className="rounded-xl bg-violet-600 px-4 py-2 text-sm text-white disabled:opacity-50">
                  {hwLoading ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          )}

          {/* ✅ Video form — showVideoForm bilan */}
          {showVideoForm && lessonTab === 'videos' && (
            <form onSubmit={handleUploadVideo} className="mb-4 rounded-xl border p-4 space-y-3">
              <div>
                <label className="mb-1 block text-sm font-medium">Dars *</label>
                <select className="w-full rounded-xl border px-4 py-2 text-sm"
                  value={videoForm.lessonId}
                  onChange={(e) => setVideoForm({ ...videoForm, lessonId: e.target.value })}>
                  <option value="">Darsni tanlang</option>
                  {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium">Video fayl *</label>
                <input type="file" accept="video/*"
                  onChange={(e) => setVideoForm({ ...videoForm, file: e.target.files?.[0] || null })} />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowVideoForm(false)}
                  className="rounded-xl border px-4 py-2 text-sm">Bekor qilish</button>
                <button type="submit" disabled={videoLoading}
                  className="rounded-xl bg-violet-600 px-4 py-2 text-sm text-white disabled:opacity-50">
                  {videoLoading ? 'Yuklanmoqda...' : 'Yuklash'}
                </button>
              </div>
            </form>
          )}

          {/* Homeworks table */}
          {lessonTab === 'homeworks' && (
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-3">#</th>
                  <th className="py-3">Mavzu</th>
                  <th className="py-3">Dars</th>
                </tr>
              </thead>
              <tbody>
                {homeworks.map((hw, i) => (
                  <tr key={hw.id} className="border-b hover:bg-slate-50">
                    <td className="py-3 text-slate-400">{i + 1}</td>
                    <td className="py-3">
                      <span className="rounded-lg bg-orange-400 px-3 py-1 text-white text-xs font-medium">{hw.title}</span>
                    </td>
                    <td className="py-3 text-slate-500">#{hw.lessonId}</td>
                  </tr>
                ))}
                {homeworks.length === 0 && (
                  <tr><td colSpan={3} className="py-8 text-center text-slate-400">Uyga vazifalar yo'q</td></tr>
                )}
              </tbody>
            </table>
          )}

          {/* Videos table */}
          {lessonTab === 'videos' && (
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b text-slate-500">
                  <th className="py-3">#</th>
                  <th className="py-3">Fayl</th>
                  <th className="py-3">Dars</th>
                  <th className="py-3">Qo'shilgan</th>
                </tr>
              </thead>
              <tbody>
                {videos.map((v, i) => (
                  <tr key={v.id} className="border-b hover:bg-slate-50">
                    <td className="py-3 text-slate-400">{i + 1}</td>
                    <td className="py-3">
                      <a href={v.file} target="_blank" rel="noreferrer" className="text-violet-600 hover:underline">
                        Video #{v.id}
                      </a>
                    </td>
                    <td className="py-3 text-slate-500">#{v.lessonId}</td>
                    <td className="py-3 text-slate-500">{formatDate(v.created_at)}</td>
                  </tr>
                ))}
                {videos.length === 0 && (
                  <tr><td colSpan={4} className="py-8 text-center text-slate-400">Videolar yo'q</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* ══ AKADEMIK DAVOMAT TAB ══ */}
      {mainTab === 'attendance' && (
        <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
          <div className="space-y-4">
            <div className="rounded-2xl border bg-white p-5">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="font-bold">Ma'lumotlar</h2>
                <span className="rounded-lg bg-slate-100 px-3 py-1 text-xs">{group.courseName}</span>
              </div>
              <div className="space-y-3 text-sm">
                <div><p className="text-slate-400">Kurs nomi</p><p className="font-medium">{group.courseName}</p></div>
                <div><p className="text-slate-400">Kurs to'lovi</p><p className="font-medium">{Number(group.price || 0).toLocaleString()} so'm</p></div>
                <div><p className="text-slate-400">O'tish kunlari</p><p className="font-medium">{group.lessonDays?.map(d => weekdayLabel[d] || d).join(', ')}</p></div>
                <div><p className="text-slate-400">O'tish vaqti</p><p className="font-medium">{group.lessonTime}</p></div>
                <div><p className="text-slate-400">O'qish davomiyligi</p><p className="font-medium">{group.lessonDurationMinutes} minut</p></div>
                <div><p className="text-slate-400">Xona</p><p className="font-medium">{group.roomName || '-'}</p></div>
              </div>
            </div>

            <div className="rounded-2xl border bg-white p-5">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-semibold">O'quvchilar</h3>
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs">{group.students?.length} ta</span>
              </div>
              <div className="max-h-64 space-y-2 overflow-auto">
                {group.students?.map((s) => (
                  <div key={s.id} className="flex items-center gap-2 rounded-xl bg-slate-50 p-3">
                    {s.photo
                      ? <img src={s.photo} className="h-8 w-8 rounded-full object-cover" />
                      : <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-600">{s.fullName?.[0]}</div>
                    }
                    <div>
                      <p className="text-sm font-medium">{s.fullName}</p>
                      <p className="text-xs text-slate-400">Faol</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="rounded-2xl border bg-white p-5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold">Davomat</h3>
              <select className="rounded-xl border px-3 py-2 text-sm"
                value={selectedLesson?.id || ''}
                onChange={(e) => {
                  const lesson = lessons.find(l => l.id === Number(e.target.value));
                  setSelectedLesson(lesson || null);
                }}>
                <option value="">Darsni tanlang</option>
                {lessons.map(l => <option key={l.id} value={l.id}>{l.title}</option>)}
              </select>
            </div>

            {!selectedLesson && (
              <div className="py-12 text-center text-slate-400">Davomat ko'rish uchun dars tanlang</div>
            )}

            {selectedLesson && (
              attendanceLoading ? (
                <div className="py-8 text-center text-slate-400">Yuklanmoqda...</div>
              ) : (
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="py-3 text-left">Talaba</th>
                      <th className="py-3 text-center">Holat</th>
                      <th className="py-3 text-center">Amal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.students?.map((student) => {
                      const record = attendanceData.find(a => String(a.student.id) === student.id);
                      const isPresent = record?.isPresent ?? false;
                      return (
                        <tr key={student.id} className="border-b">
                          <td className="py-3">
                            <div className="flex items-center gap-2">
                              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-600">
                                {student.fullName?.[0]}
                              </div>
                              <div>
                                <p className="font-medium">{student.fullName}</p>
                                <p className="text-xs text-slate-400">Faol</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 text-center">
                            <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                              record
                                ? (isPresent ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600')
                                : 'bg-slate-100 text-slate-400'
                            }`}>
                              {record ? (isPresent ? 'Bor' : "Yo'q") : 'Belgilanmagan'}
                            </span>
                          </td>
                          <td className="py-3 text-center">
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => handleToggleAttendance(Number(student.id), selectedLesson.id, false)}
                                className={`rounded px-3 py-1 text-xs font-medium ${isPresent ? 'bg-green-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                Bor
                              </button>
                              <button
                                onClick={() => handleToggleAttendance(Number(student.id), selectedLesson.id, true)}
                                className={`rounded px-3 py-1 text-xs font-medium ${!isPresent && record ? 'bg-red-500 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                Yo'q
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )
            )}
          </div>
        </div>
      )}

      {/* ── Add Student Modal ── */}
      {showAddStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold">O'quvchi qo'shish</h3>
              <button onClick={() => setShowAddStudent(false)}>✕</button>
            </div>
            <select className="w-full rounded-xl border px-4 py-3 mb-4"
              value={selectedStudentId}
              onChange={(e) => setSelectedStudentId(e.target.value)}>
              <option value="">O'quvchini tanlang</option>
              {allStudents.map(s => (
                <option key={s.id} value={s.id}>{s.fullName} — {s.email}</option>
              ))}
            </select>
            {error && <p className="mb-3 text-sm text-red-500">{error}</p>}
            <div className="flex justify-end gap-3">
              <button onClick={() => setShowAddStudent(false)}
                className="rounded-xl border px-4 py-2 text-sm">Bekor qilish</button>
              <button onClick={handleAddStudent} disabled={addStudentLoading}
                className="rounded-xl bg-violet-600 px-4 py-2 text-sm text-white disabled:opacity-50">
                {addStudentLoading ? "Qo'shilmoqda..." : "Qo'shish"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}