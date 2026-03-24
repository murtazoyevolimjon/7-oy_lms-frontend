import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '@/api/axios';
import { groupsApi, type GroupPayload } from '@/api/groups.api';
import { coursesApi } from '@/api/courses.api';
import { roomsApi } from '@/api/rooms.api';
import { Pencil, Trash2, MoreHorizontal } from 'lucide-react';

type Group = {
  id: string;
  name: string;
  status: string;
  courseName: string;
  lessonDurationMinutes: number;
  lessonTime: string;
  weekDays: string[];
  roomName?: string | null;
  teacherName?: string | null;
  createdBy?: string | null;
  studentsCount: number;
};

type Option = { id: string; name: string };

const weekdays = [
  { value: 'MONDAY', label: 'Dushanba' },
  { value: 'TUESDAY', label: 'Seshanba' },
  { value: 'WEDNESDAY', label: 'Chorshanba' },
  { value: 'THURSDAY', label: 'Payshanba' },
  { value: 'FRIDAY', label: 'Juma' },
  { value: 'SATURDAY', label: 'Shanba' },
  { value: 'SUNDAY', label: 'Yakshanba' },
];

const weekdayShort: Record<string, string> = {
  MONDAY: 'Dushanba',
  TUESDAY: 'Seshanba',
  WEDNESDAY: 'Chorshanba',
  THURSDAY: 'Payshanba',
  FRIDAY: 'Juma',
  SATURDAY: 'Shanba',
  SUNDAY: 'Yakshanba',
};

const initialForm: GroupPayload = {
  name: '',
  courseId: '',
  roomId: '',
  teacherId: '',
  weekDays: [],
  startTime: '',
  startDate: '',
  endDate: '',
};

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [stats, setStats] = useState({ totalGroups: 0, teachersCount: 0, studentsCount: 0 });
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editGroup, setEditGroup] = useState<Group | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [courses, setCourses] = useState<Option[]>([]);
  const [rooms, setRooms] = useState<Option[]>([]);
  const [teachers, setTeachers] = useState<Option[]>([]);
  const [form, setForm] = useState<GroupPayload>(initialForm);
  const [editForm, setEditForm] = useState<Partial<GroupPayload>>(initialForm);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleWeekDay = (value: string, isEdit = false) => {
    if (isEdit) {
      setEditForm((prev) => ({
        ...prev,
        weekDays: (prev.weekDays || []).includes(value)
          ? (prev.weekDays || []).filter((x) => x !== value)
          : [...(prev.weekDays || []), value],
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        weekDays: prev.weekDays.includes(value)
          ? prev.weekDays.filter((x) => x !== value)
          : [...prev.weekDays, value],
      }));
    }
  };

  const load = async () => {
    const [groupsRes, coursesRes, roomsRes, teachersRes, statsRes] = await Promise.all([
      groupsApi.list(),
      coursesApi.list().catch(() => []),
      roomsApi.list().catch(() => ({ data: [] })),
      api.get('/teachers/all').catch(() => ({ data: [] })),
      api.get('/dashboard/group-stats').catch(() => ({
        data: { totalGroups: 0, teachersCount: 0, studentsCount: 0 },
      })),
    ]);

    setGroups(groupsRes?.data || groupsRes || []);
    setCourses(Array.isArray(coursesRes) ? coursesRes : (coursesRes?.data ?? []));
    const roomsList = roomsRes?.data || roomsRes || [];
    setRooms(Array.isArray(roomsList) ? roomsList : []);
    setTeachers(
      (teachersRes.data?.data || teachersRes.data || []).map((x: any) => ({
        id: String(x.id),
        name: x.fullName,
      }))
    );
    setStats(statsRes.data || { totalGroups: 0, teachersCount: 0, studentsCount: 0 });
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await groupsApi.create(form);
      setOpen(false);
      setForm(initialForm);
      await load();
    } catch (err: any) {
      const message = err?.response?.data?.message;
      setError(Array.isArray(message) ? message.join(', ') : message || 'Xato yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const openEdit = (group: Group) => {
    setEditGroup(group);
    setEditForm({
      name: group.name,
      weekDays: group.weekDays || [],
      startTime: group.lessonTime || '',
    });
    setEditOpen(true);
    setOpenMenuId(null);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editGroup) return;
    setError('');
    setLoading(true);
    try {
      await groupsApi.update(editGroup.id, editForm);
      setEditOpen(false);
      setEditGroup(null);
      await load();
    } catch (err: any) {
      const message = err?.response?.data?.message;
      setError(Array.isArray(message) ? message.join(', ') : message || 'Xato yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Guruhni o'chirishni tasdiqlaysizmi?")) return;
    setOpenMenuId(null);
    try {
      await groupsApi.remove(id);
      await load();
    } catch {
      alert("O'chirishda xatolik yuz berdi");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        {/* ✅ TUZATILDI: dark modeda oq rang */}
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Guruhlar</h1>
        <button onClick={() => setOpen(true)} className="rounded-xl bg-violet-600 px-4 py-3 text-white hover:bg-violet-700">
          + Guruh qo'shish
        </button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* ✅ TUZATILDI: dark modeda karta rangi */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">Jami guruhlar</p>
          <h3 className="mt-3 text-4xl font-bold text-gray-900 dark:text-white">{stats.totalGroups}</h3>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">O'qituvchilar</p>
          <h3 className="mt-3 text-4xl font-bold text-gray-900 dark:text-white">{stats.teachersCount}</h3>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-gray-800">
          <p className="text-sm text-slate-500 dark:text-slate-400">Talabalar</p>
          <h3 className="mt-3 text-4xl font-bold text-gray-900 dark:text-white">{stats.studentsCount}</h3>
        </div>
      </div>

      {/* Table */}
      {/* ✅ TUZATILDI: jadval dark mode */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-slate-500 dark:border-gray-700 dark:text-slate-400">
                <th className="py-3">Status</th>
                <th className="py-3">Guruh</th>
                <th className="py-3">Kurs</th>
                <th className="py-3">Davomiyligi</th>
                <th className="py-3">Dars vaqti</th>
                <th className="py-3">Kim qo'shgan</th>
                <th className="py-3">Xona</th>
                <th className="py-3">O'qituvchi</th>
                <th className="py-3">Talabalar</th>
                <th className="py-3">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {groups.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-8 text-center text-slate-400 dark:text-slate-500">
                    Guruhlar mavjud emas
                  </td>
                </tr>
              ) : (
                groups.map((group) => (
                  <tr key={group.id} className="border-b border-gray-100 hover:bg-slate-50 dark:border-gray-700 dark:hover:bg-gray-700">
                    <td className="py-3">
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        {group.status}
                      </span>
                    </td>
                    <td className="py-3">
                      <Link to={`/groups/${group.id}`} className="font-medium text-violet-600 hover:underline dark:text-violet-400">
                        {group.name}
                      </Link>
                    </td>
                    <td className="py-3 text-gray-700 dark:text-gray-300">{group.courseName}</td>
                    <td className="py-3 text-gray-700 dark:text-gray-300">{group.lessonDurationMinutes} minut</td>
                    <td className="py-3">
                      <span className="font-medium text-gray-900 dark:text-white">{group.lessonTime}</span>
                      {group.weekDays?.length > 0 && (
                        <div className="text-xs text-slate-400 dark:text-slate-500">
                          {group.weekDays.map((d) => weekdayShort[d] || d).join(', ')}
                        </div>
                      )}
                    </td>
                    <td className="py-3 text-gray-700 dark:text-gray-300">{group.createdBy || '-'}</td>
                    <td className="py-3 text-gray-700 dark:text-gray-300">{group.roomName || '-'}</td>
                    <td className="py-3 text-gray-700 dark:text-gray-300">{group.teacherName || '-'}</td>
                    <td className="py-3 text-gray-700 dark:text-gray-300">{group.studentsCount}</td>
                    <td className="py-3">
                      <div className="relative" ref={openMenuId === group.id ? menuRef : null}>
                        <button
                          onClick={() => setOpenMenuId(openMenuId === group.id ? null : group.id)}
                          className="rounded-lg border border-gray-200 px-3 py-1 hover:bg-slate-100 dark:border-gray-600 dark:hover:bg-gray-700"
                        >
                          <MoreHorizontal size={16} className="text-gray-600 dark:text-gray-300" />
                        </button>
                        {openMenuId === group.id && (
                          <div className="absolute right-0 top-8 z-10 w-40 rounded-xl border border-gray-200 bg-white shadow-lg dark:border-gray-700 dark:bg-gray-800">
                            <button
                              onClick={() => openEdit(group)}
                              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-slate-50 dark:text-gray-300 dark:hover:bg-gray-700"
                            >
                              <Pencil size={14} /> Tahrirlash
                            </button>
                            <button
                              onClick={() => handleDelete(group.id)}
                              className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 size={14} /> O'chirish
                            </button>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Qo'shish modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20">
          {/* ✅ TUZATILDI: modal dark mode */}
          <div className="h-full w-full max-w-lg overflow-y-auto bg-white p-5 shadow-2xl dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Guruh qo'shish</h2>
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                placeholder="Guruh nomi"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />

              <select
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                value={form.courseId}
                onChange={(e) => setForm({ ...form, courseId: e.target.value })}
              >
                <option value="">Kursni tanlang</option>
                {courses.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
              </select>

              <select
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                value={form.roomId}
                onChange={(e) => setForm({ ...form, roomId: e.target.value })}
              >
                <option value="">Xonani tanlang</option>
                {rooms.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
              </select>

              <select
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                value={form.teacherId}
                onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
              >
                <option value="">O'qituvchini tanlang</option>
                {teachers.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}
              </select>

              <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                <p className="mb-2 font-medium text-gray-900 dark:text-white">Dars kunlari</p>
                <div className="grid grid-cols-2 gap-2">
                  {weekdays.map((d) => (
                    <label key={d.value} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={form.weekDays.includes(d.value)}
                        onChange={() => toggleWeekDay(d.value)}
                      />
                      {d.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Dars vaqti</label>
                <input
                  type="time"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                />
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Boshlanish sanasi</label>
                <input
                  type="date"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  value={form.startDate}
                  onChange={(e) => setForm({ ...form, startDate: e.target.value })}
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-violet-600 px-4 py-2 text-white disabled:opacity-50 hover:bg-violet-700"
                >
                  {loading ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tahrirlash modal */}
      {editOpen && editGroup && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20">
          <div className="h-full w-full max-w-lg overflow-y-auto bg-white p-5 shadow-2xl dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Guruhni tahrirlash</h2>
              <button onClick={() => setEditOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">✕</button>
            </div>
            <form onSubmit={handleEdit} className="space-y-4">
              <input
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                placeholder="Guruh nomi"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />

              <div className="rounded-xl border border-gray-200 p-4 dark:border-gray-700">
                <p className="mb-2 font-medium text-gray-900 dark:text-white">Dars kunlari</p>
                <div className="grid grid-cols-2 gap-2">
                  {weekdays.map((d) => (
                    <label key={d.value} className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                      <input
                        type="checkbox"
                        checked={(editForm.weekDays || []).includes(d.value)}
                        onChange={() => toggleWeekDay(d.value, true)}
                      />
                      {d.label}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">Dars vaqti</label>
                <input
                  type="time"
                  className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
                  value={editForm.startTime}
                  onChange={(e) => setEditForm({ ...editForm, startTime: e.target.value })}
                />
              </div>

              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setEditOpen(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Bekor qilish
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="rounded-xl bg-violet-600 px-4 py-2 text-white disabled:opacity-50 hover:bg-violet-700"
                >
                  {loading ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}