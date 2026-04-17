import { useEffect, useState } from 'react';
import { teachersApi, type TeacherPayload } from '@/api/teachers.api';
import { formatDate } from '@/lib/utils';
import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';

type Teacher = {
  id: number;
  fullName: string;
  email: string;
  photo?: string | null;
  position: string;
  experience: number;
  status: string;
  created_at: string;
  adminPassword?: string;
};

type TeacherFormState = Omit<TeacherPayload, 'experience'> & {
  experience: string;
};

type TeacherEditFormState = {
  fullName: string;
  email: string;
  password: string;
  position: string;
  experience: string;
  photo?: File | null;
};

const initialForm: TeacherFormState = {
  fullName: '',
  email: '',
  password: '',
  position: '',
  experience: '',
  photo: null,
};

const initialEditForm: TeacherEditFormState = {
  fullName: '',
  email: '',
  password: '',
  position: '',
  experience: '',
  photo: null,
};

const TEACHER_PASSWORDS_STORAGE_KEY = 'crm-admin-teacher-passwords';

const loadTeacherPasswords = (): Record<string, string> => {
  try {
    const raw = localStorage.getItem(TEACHER_PASSWORDS_STORAGE_KEY);
    if (!raw) return {};

    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};

    return Object.fromEntries(
      Object.entries(parsed).filter(([, value]) => typeof value === 'string'),
    ) as Record<string, string>;
  } catch {
    return {};
  }
};

const saveTeacherPasswords = (store: Record<string, string>) => {
  localStorage.setItem(TEACHER_PASSWORDS_STORAGE_KEY, JSON.stringify(store));
};

const setTeacherPassword = (id: number, password: string) => {
  const trimmed = password.trim();
  const store = loadTeacherPasswords();

  if (!trimmed) {
    delete store[String(id)];
  } else {
    store[String(id)] = trimmed;
  }

  saveTeacherPasswords(store);
};

const parseExperienceOrThrow = (value: string) => {
  if (value.trim() === '') {
    throw new Error('Tajriba maydoni majburiy');
  }

  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error("Tajriba uchun to'g'ri raqam kiriting");
  }

  return parsed;
};

export default function TeachersPage() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editTeacher, setEditTeacher] = useState<Teacher | null>(null);
  const [form, setForm] = useState<TeacherFormState>(initialForm);
  const [editForm, setEditForm] = useState<TeacherEditFormState>(initialEditForm);
  const [showCreatePassword, setShowCreatePassword] = useState(true);
  const [showEditPassword, setShowEditPassword] = useState(true);

  const fetchTeachers = async () => {
    try {
      const res = await teachersApi.list();
      const rows: Teacher[] = res?.data || res || [];
      const storedPasswords = loadTeacherPasswords();
      setTeachers(
        rows.map((teacher) => ({
          ...teacher,
          adminPassword: storedPasswords[String(teacher.id)] || '',
        })),
      );
    } catch {
      setError("O'qituvchilarni yuklashda xatolik.");
    }
  };

  useEffect(() => {
    fetchTeachers();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const payload: TeacherPayload = {
        fullName: form.fullName,
        email: form.email,
        password: form.password,
        position: form.position,
        experience: parseExperienceOrThrow(form.experience),
        photo: form.photo,
      };

      const res = await teachersApi.create(payload);
      const createdId = Number(res?.data?.id);
      if (Number.isFinite(createdId) && form.password.trim()) {
        setTeacherPassword(createdId, form.password);
      }

      setOpen(false);
      setForm(initialForm);
      setShowCreatePassword(false);
      fetchTeachers();
    } catch (err: any) {
      const message = err?.message || err?.response?.data?.message;
      setError(Array.isArray(message) ? message.join(', ') : message || 'Xato yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("O'qituvchini o'chirishni tasdiqlaysizmi?")) return;
    try {
      setDeleteId(id);
      await teachersApi.remove(String(id));
      fetchTeachers();
    } catch (err: any) {
      alert(err?.response?.data?.message || "O'chirishda xato");
    } finally {
      setDeleteId(null);
    }
  };

  const openEdit = (teacher: Teacher) => {
    setEditTeacher(teacher);
    setShowEditPassword(false);
    setEditForm({
      fullName: teacher.fullName,
      email: teacher.email,
      password: teacher.adminPassword || '',
      position: teacher.position,
      experience: String(teacher.experience),
      photo: null,
    });
    setEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editTeacher) return;
    setError('');
    setLoading(true);
    try {
      const payload: Partial<TeacherPayload> = {
        fullName: editForm.fullName,
        email: editForm.email,
        position: editForm.position,
        experience: parseExperienceOrThrow(editForm.experience),
        photo: editForm.photo ?? undefined,
      };

      const nextPassword = editForm.password.trim();
      if (nextPassword) {
        payload.password = nextPassword;
      }

      await teachersApi.update(String(editTeacher.id), payload);
      if (nextPassword) {
        setTeacherPassword(editTeacher.id, nextPassword);
      }

      setEditOpen(false);
      setEditTeacher(null);
      setEditForm(initialEditForm);
      fetchTeachers();
    } catch (err: any) {
      const message = err?.message || err?.response?.data?.message;
      setError(Array.isArray(message) ? message.join(', ') : message || 'Xato yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const filtered = teachers.filter(
    (t) =>
      t.fullName.toLowerCase().includes(search.toLowerCase()) ||
      t.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        {/* ✅ dark modeda oq rang */}
        <h1 className="text-3xl font-bold dark:text-white">O'qituvchilar</h1>
        <button onClick={() => setOpen(true)} className="rounded-xl bg-violet-600 px-4 py-3 text-white">
          O'qituvchi qo'shish
        </button>
      </div>

      {/* ✅ karta dark mode */}
      <div className="rounded-2xl border bg-white dark:bg-slate-800 dark:border-slate-700 p-4">
        <div className="mb-4 flex justify-end">
          {/* ✅ input dark mode */}
          <input
            className="w-80 rounded-xl border px-4 py-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
            placeholder="Qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              {/* ✅ thead dark mode */}
              <tr className="border-b dark:border-slate-700 text-slate-500 dark:text-slate-400">
                <th className="py-3">ID</th>
                <th className="py-3">Nomi</th>
                <th className="py-3">Email</th>
                <th className="py-3">Lavozim</th>
                <th className="py-3">Tajriba</th>
                <th className="py-3">Status</th>
                <th className="py-3">Yaratilgan sana</th>
                <th className="py-3">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id} className="border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700">
                  <td className="py-3 font-medium text-slate-400 dark:text-slate-500">#{item.id}</td>
                  <td className="py-3 dark:text-white">
                    <div className="flex items-center gap-2">
                      {item.photo ? (
                        <img src={item.photo} className="h-8 w-8 rounded-full object-cover" />
                      ) : (
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-violet-100 text-sm font-medium text-violet-600">
                          {item.fullName[0]}
                        </div>
                      )}
                      {item.fullName}
                    </div>
                  </td>
                  <td className="py-3 dark:text-slate-300">{item.email}</td>
                  <td className="py-3 dark:text-slate-300">{item.position}</td>
                  <td className="py-3 dark:text-slate-300">{item.experience} yil</td>
                  <td className="py-3">
                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700">
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 dark:text-slate-300">{formatDate(item.created_at)}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => openEdit(item)}
                        className="flex items-center gap-1 rounded-lg border border-blue-200 px-3 py-1 text-sm text-blue-500 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/30"
                      >
                        <Pencil size={14} /> Tahrirlash
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        disabled={deleteId === item.id}
                        className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1 text-sm text-red-500 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/30 disabled:opacity-50"
                      >
                        <Trash2 size={14} /> {deleteId === item.id ? '...' : "O'chirish"}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Qo'shish modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20">
          {/* ✅ modal dark mode */}
          <div className="h-full w-full max-w-md overflow-y-auto bg-white dark:bg-slate-800 p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold dark:text-white">O'qituvchi qo'shish</h2>
              <button
                onClick={() => {
                  setOpen(false);
                  setShowCreatePassword(false);
                }}
                className="dark:text-white"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input className="w-full rounded-xl border px-4 py-3 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400" placeholder="FIO"
                value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              <input className="w-full rounded-xl border px-4 py-3 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400" placeholder="Email"
                value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              <div className="relative">
                <input
                  type={showCreatePassword ? 'text' : 'password'}
                  className="w-full rounded-xl border px-4 py-3 pr-12 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
                  placeholder="Parol"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowCreatePassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
                  aria-label="Parolni ko'rsatish yoki yashirish"
                >
                  {showCreatePassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <input className="w-full rounded-xl border px-4 py-3 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400" placeholder="Lavozim"
                value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
              <input
                type="text"
                inputMode="numeric"
                className="w-full rounded-xl border px-4 py-3 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
                placeholder="Tajriba (yil)"
                value={form.experience}
                onChange={(e) => setForm({ ...form, experience: e.target.value.replace(/[^\d]/g, '') })}
              />
              <input type="file" accept="image/*" className="dark:text-slate-300"
                onChange={(e) => setForm({ ...form, photo: e.target.files?.[0] || null })} />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setOpen(false);
                    setShowCreatePassword(false);
                  }}
                  className="rounded-xl border px-4 py-2 dark:border-slate-600 dark:text-white"
                >
                  Bekor qilish
                </button>
                <button type="submit" disabled={loading} className="rounded-xl bg-violet-600 px-4 py-2 text-white disabled:opacity-50">
                  {loading ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tahrirlash modal */}
      {editOpen && editTeacher && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20">
          {/* ✅ modal dark mode */}
          <div className="h-full w-full max-w-md overflow-y-auto bg-white dark:bg-slate-800 p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold dark:text-white">O'qituvchini tahrirlash</h2>
              <button onClick={() => setEditOpen(false)} className="dark:text-white">✕</button>
            </div>
            <form onSubmit={handleEdit} className="space-y-4">
              <input className="w-full rounded-xl border px-4 py-3 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400" placeholder="FIO"
                value={editForm.fullName} onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })} />
              <input className="w-full rounded-xl border px-4 py-3 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400" placeholder="Email"
                value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
              <div>
                <label className="mb-1 block text-sm font-medium dark:text-slate-300">Parol</label>
                <div className="relative">
                  <input
                    type={showEditPassword ? 'text' : 'password'}
                    className="w-full rounded-xl border px-4 py-3 pr-12 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
                    placeholder="Parol kiriting"
                    value={editForm.password}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowEditPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label="Parolni ko'rsatish yoki yashirish"
                  >
                    {showEditPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Admin shu maydonda parolni qo'lda o'rnatadi va brauzerda eslab qolinadi.
                </p>
              </div>
              <input className="w-full rounded-xl border px-4 py-3 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400" placeholder="Lavozim"
                value={editForm.position} onChange={(e) => setEditForm({ ...editForm, position: e.target.value })} />
              <input
                type="text"
                inputMode="numeric"
                className="w-full rounded-xl border px-4 py-3 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
                placeholder="Tajriba (yil)"
                value={editForm.experience}
                onChange={(e) => setEditForm({ ...editForm, experience: e.target.value.replace(/[^\d]/g, '') })}
              />
              <input type="file" accept="image/*" className="dark:text-slate-300"
                onChange={(e) => setEditForm({ ...editForm, photo: e.target.files?.[0] || null })} />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setEditOpen(false)} className="rounded-xl border px-4 py-2 dark:border-slate-600 dark:text-white">Bekor qilish</button>
                <button type="submit" disabled={loading} className="rounded-xl bg-violet-600 px-4 py-2 text-white disabled:opacity-50">
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