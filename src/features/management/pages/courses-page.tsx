import { useEffect, useState } from 'react';
import { coursesApi, type CoursePayload } from '@/api/courses.api';
import { Pencil, Trash2 } from 'lucide-react';

type Course = {
  id: string;
  name: string;
  description?: string;
  durationLesson: number;
  durationMonth: number;
  price: number;
  status?: string;
  level?: string;
};

const levelOptions = [
  { value: 'BEGINNER', label: "Boshlang'ich" },
  { value: 'INTERMEDIATE', label: "O'rta" },
  { value: 'ADVANCED', label: 'Yuqori' },
];

const initialForm: CoursePayload = {
  name: '', durationMonth: 1, durationLesson: 60, price: 0, description: '', level: 'BEGINNER',
};

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editCourse, setEditCourse] = useState<Course | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<CoursePayload>(initialForm);
  const [editForm, setEditForm] = useState<Partial<CoursePayload>>({
    name: '', durationMonth: 1, durationLesson: 60, price: 0, description: '', level: 'BEGINNER',
  });

  const load = async () => {
    try {
      const res = await coursesApi.list();
      const list = Array.isArray(res) ? res : (res?.data ?? res?.items ?? []);
      setCourses(list);
    } catch {
      setError("Kurslarni yuklashda xatolik yuz berdi.");
    }
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await coursesApi.create(form);
      setOpen(false);
      setForm(initialForm);
      load();
    } catch (err: any) {
      const message = err?.response?.data?.message;
      setError(Array.isArray(message) ? message.join(', ') : message || 'Xato yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Kursni o'chirishni tasdiqlaysizmi?")) return;
    try {
      setDeleteId(id);
      await coursesApi.remove(id);
      load();
    } catch (err: any) {
      alert(err?.response?.data?.message || "O'chirishda xato");
    } finally {
      setDeleteId(null);
    }
  };

  const openEdit = (course: Course) => {
    setEditCourse(course);
    setEditForm({
      name: course.name,
      durationLesson: course.durationLesson,
      durationMonth: course.durationMonth,
      price: Number(course.price),
      description: course.description || '',
      level: course.level || 'BEGINNER',
    });
    setEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editCourse) return;
    setError('');
    setLoading(true);
    try {
      await coursesApi.update(editCourse.id, editForm);
      setEditOpen(false);
      setEditCourse(null);
      load();
    } catch (err: any) {
      const message = err?.response?.data?.message;
      setError(Array.isArray(message) ? message.join(', ') : message || 'Xato yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  // Reusable input/select/textarea classes
  const inputCls = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500";
  const labelCls = "mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Kurslar</h1>
        <button
          onClick={() => setOpen(true)}
          className="rounded-xl bg-violet-600 px-4 py-3 text-white hover:bg-violet-700"
        >
          Kurs qo'shish
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-slate-500 dark:border-gray-700 dark:text-slate-400">
                <th className="py-3">ID</th>
                <th className="py-3">Nomi</th>
                <th className="py-3">Tavsif</th>
                <th className="py-3">Dars davomiyligi</th>
                <th className="py-3">Kurs davomiyligi</th>
                <th className="py-3">Narx</th>
                <th className="py-3">Daraja</th>
                <th className="py-3">Status</th>
                <th className="py-3">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {courses.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-400 dark:text-slate-500">
                    Kurslar mavjud emas
                  </td>
                </tr>
              ) : (
                courses.map((course) => (
                  <tr key={course.id} className="border-b border-gray-100 hover:bg-slate-50 dark:border-gray-700 dark:hover:bg-gray-700">
                    <td className="py-3 text-slate-400 dark:text-slate-500">#{course.id}</td>
                    <td className="py-3 font-medium text-gray-900 dark:text-white">{course.name}</td>
                    <td className="py-3 text-slate-500 dark:text-slate-400">{course.description || '-'}</td>
                    <td className="py-3 text-gray-700 dark:text-gray-300">{course.durationLesson} min</td>
                    <td className="py-3 text-gray-700 dark:text-gray-300">{course.durationMonth} oy</td>
                    <td className="py-3 text-gray-700 dark:text-gray-300">{Number(course.price).toLocaleString()} so'm</td>
                    <td className="py-3 text-gray-700 dark:text-gray-300">{course.level || '-'}</td>
                    <td className="py-3">
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        {course.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(course)}
                          className="flex items-center gap-1 rounded-lg border border-blue-200 px-3 py-1 text-sm text-blue-500 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/20"
                        >
                          <Pencil size={14} /> Tahrirlash
                        </button>
                        <button
                          onClick={() => handleDelete(course.id)}
                          disabled={deleteId === course.id}
                          className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1 text-sm text-red-500 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:hover:bg-red-900/20"
                        >
                          <Trash2 size={14} /> {deleteId === course.id ? '...' : "O'chirish"}
                        </button>
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
          <div className="h-full w-full max-w-md overflow-y-auto bg-white p-5 shadow-2xl dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Kurs qo'shish</h2>
              <button onClick={() => setOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">✕</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className={labelCls}>Kurs nomi</label>
                <input className={inputCls} placeholder="Masalan: Backend development"
                  value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>Dars davomiyligi (daqiqa)</label>
                <input type="number" className={inputCls}
                  value={form.durationLesson} onChange={(e) => setForm({ ...form, durationLesson: Number(e.target.value) })} />
              </div>
              <div>
                <label className={labelCls}>Kurs davomiyligi (oy)</label>
                <input type="number" className={inputCls}
                  value={form.durationMonth} onChange={(e) => setForm({ ...form, durationMonth: Number(e.target.value) })} />
              </div>
              <div>
                <label className={labelCls}>Narx (so'm)</label>
                <input type="number" className={inputCls}
                  value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
              </div>
              <div>
                <label className={labelCls}>Daraja</label>
                <select className={inputCls}
                  value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })}>
                  {levelOptions.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Tavsif</label>
                <textarea className={inputCls} placeholder="Kurs haqida qisqacha..."
                  value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setOpen(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                  Bekor qilish
                </button>
                <button type="submit" disabled={loading}
                  className="rounded-xl bg-violet-600 px-4 py-2 text-white hover:bg-violet-700 disabled:opacity-50">
                  {loading ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tahrirlash modal */}
      {editOpen && editCourse && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20">
          <div className="h-full w-full max-w-md overflow-y-auto bg-white p-5 shadow-2xl dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Kursni tahrirlash</h2>
              <button onClick={() => setEditOpen(false)} className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200">✕</button>
            </div>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className={labelCls}>Kurs nomi</label>
                <input className={inputCls}
                  value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>Dars davomiyligi (daqiqa)</label>
                <input type="number" className={inputCls}
                  value={editForm.durationLesson} onChange={(e) => setEditForm({ ...editForm, durationLesson: Number(e.target.value) })} />
              </div>
              <div>
                <label className={labelCls}>Kurs davomiyligi (oy)</label>
                <input type="number" className={inputCls}
                  value={editForm.durationMonth} onChange={(e) => setEditForm({ ...editForm, durationMonth: Number(e.target.value) })} />
              </div>
              <div>
                <label className={labelCls}>Narx (so'm)</label>
                <input type="number" className={inputCls}
                  value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: Number(e.target.value) })} />
              </div>
              <div>
                <label className={labelCls}>Daraja</label>
                <select className={inputCls}
                  value={editForm.level} onChange={(e) => setEditForm({ ...editForm, level: e.target.value })}>
                  {levelOptions.map((l) => <option key={l.value} value={l.value}>{l.label}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Tavsif</label>
                <textarea className={inputCls}
                  value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} />
              </div>
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setEditOpen(false)}
                  className="rounded-xl border border-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800">
                  Bekor qilish
                </button>
                <button type="submit" disabled={loading}
                  className="rounded-xl bg-violet-600 px-4 py-2 text-white hover:bg-violet-700 disabled:opacity-50">
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