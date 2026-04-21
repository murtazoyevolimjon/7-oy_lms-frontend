import { useEffect, useState } from 'react';
import { studentsApi, type StudentPayload } from '@/api/students.api';
import { formatDate } from '@/lib/utils';
import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

type Student = {
  id: number;
  fullName: string;
  email: string;
  photo?: string | null;
  birth_date: string;
  status: string;
  created_at: string;
  adminPassword?: string;
};

const initialForm: StudentPayload = {
  fullName: '',
  email: '',
  password: '',
  birthDate: '',
  photo: null,
};

const STUDENT_PASSWORDS_STORAGE_KEY = 'crm-admin-student-passwords';

const loadStudentPasswords = (): Record<string, string> => {
  try {
    const raw = localStorage.getItem(STUDENT_PASSWORDS_STORAGE_KEY);
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

const saveStudentPasswords = (store: Record<string, string>) => {
  localStorage.setItem(STUDENT_PASSWORDS_STORAGE_KEY, JSON.stringify(store));
};

const setStudentPassword = (id: number, password: string) => {
  const trimmed = password.trim();
  const store = loadStudentPasswords();

  if (!trimmed) {
    delete store[String(id)];
  } else {
    store[String(id)] = trimmed;
  }

  saveStudentPasswords(store);
};

export default function StudentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const statusFilter = (searchParams.get('status') || '').toUpperCase();

  const [students, setStudents] = useState<Student[]>([]);
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [editStudent, setEditStudent] = useState<Student | null>(null);
  const [showCreatePassword, setShowCreatePassword] = useState(true);
  const [showPassword, setShowPassword] = useState(true);
  const [visiblePasswordIds, setVisiblePasswordIds] = useState<Record<number, boolean>>({});
  const [form, setForm] = useState<StudentPayload>(initialForm);
  const [editForm, setEditForm] = useState<Partial<StudentPayload>>({
    fullName: '',
    email: '',
    birthDate: '',
    password: '',
  });

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const res = await studentsApi.list(statusFilter || undefined);
      const rows: Student[] = res?.data || res || [];
      const storedPasswords = loadStudentPasswords();
      setStudents(
        rows.map((student) => ({
          ...student,
          adminPassword: storedPasswords[String(student.id)] || '',
        })),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [statusFilter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await studentsApi.create(form);
      const createdId = Number(res?.data?.id);
      if (Number.isFinite(createdId) && form.password.trim()) {
        setStudentPassword(createdId, form.password);
      }

      setOpen(false);
      setForm(initialForm);
      fetchStudents();
    } catch (err: any) {
      const message = err?.response?.data?.message;
      setError(Array.isArray(message) ? message.join(', ') : message || 'Xato yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Talabani o'chirishni tasdiqlaysizmi?")) return;
    try {
      setDeleteId(id);
      await studentsApi.remove(String(id));
      fetchStudents();
    } catch (err: any) {
      alert(err?.response?.data?.message || "O'chirishda xato yuz berdi");
    } finally {
      setDeleteId(null);
    }
  };

  const openEdit = (student: Student) => {
    setEditStudent(student);
    setShowPassword(true);
    setEditForm({
      fullName: student.fullName,
      email: student.email,
      birthDate: student.birth_date?.split('T')[0] || '',
      password: student.adminPassword || '',
    });
    setEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editStudent) return;
    setError('');
    setSubmitting(true);
    try {
      const payload: Partial<StudentPayload> = {
        fullName: editForm.fullName,
        email: editForm.email,
        birthDate: editForm.birthDate,
        photo: editForm.photo,
      };

      const nextPassword = String(editForm.password || '').trim();
      if (nextPassword) {
        payload.password = nextPassword;
      }

      await studentsApi.update(String(editStudent.id), payload);
      if (nextPassword) {
        setStudentPassword(editStudent.id, nextPassword);
      }

      setEditOpen(false);
      setEditStudent(null);
      fetchStudents();
    } catch (err: any) {
      const message = err?.response?.data?.message;
      setError(Array.isArray(message) ? message.join(', ') : message || 'Xato yuz berdi');
    } finally {
      setSubmitting(false);
    }
  };

  const filtered = students.filter(
    (s) =>
      s.fullName.toLowerCase().includes(search.toLowerCase()) ||
      s.email.toLowerCase().includes(search.toLowerCase())
  );

  const setFilter = (nextFilter: '' | 'ACTIVE' | 'FREEZE') => {
    if (!nextFilter) {
      setSearchParams({});
      return;
    }
    setSearchParams({ status: nextFilter });
  };

  const getStatusBadgeClass = (status: string) => {
    const normalized = String(status).toUpperCase();
    if (normalized === 'ACTIVE') {
      return 'bg-green-100 text-green-700';
    }
    if (normalized === 'FREEZE' || normalized === 'INACTIVE') {
      return 'bg-amber-100 text-amber-700';
    }
    return 'bg-slate-100 text-slate-700';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        {/* ✅ sarlavha dark mode */}
        <h1 className="text-3xl font-bold dark:text-white">Talabalar</h1>
        <button onClick={() => setOpen(true)} className="rounded-xl bg-violet-600 px-4 py-3 text-white">
          Talaba qo'shish
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setFilter('')}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition ${!statusFilter ? 'bg-violet-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
        >
          Barchasi
        </button>
        <button
          type="button"
          onClick={() => setFilter('ACTIVE')}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition ${statusFilter === 'ACTIVE' ? 'bg-violet-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
        >
          Faol talabalar
        </button>
        <button
          type="button"
          onClick={() => setFilter('FREEZE')}
          className={`rounded-xl px-4 py-2 text-sm font-medium transition ${statusFilter === 'FREEZE' ? 'bg-violet-600 text-white' : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
        >
          Muzlatilgan talabalar
        </button>
      </div>

      {/* ✅ karta dark mode */}
      <div className="rounded-2xl border bg-white dark:bg-slate-800 dark:border-slate-700 p-4">
        <div className="mb-4">
          {/* ✅ input dark mode */}
          <input
            className="w-80 rounded-xl border px-4 py-2 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
            placeholder="Qidirish..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div className="py-10 text-center text-slate-500 dark:text-slate-400">Yuklanmoqda...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                {/* ✅ thead dark mode */}
                <tr className="border-b dark:border-slate-700 text-slate-500 dark:text-slate-400">
                  <th className="py-3">ID</th>
                  <th className="py-3">Nomi</th>
                  <th className="py-3">Email</th>
                  <th className="py-3">Parol</th>
                  <th className="py-3">Tug'ilgan sana</th>
                  <th className="py-3">Status</th>
                  <th className="py-3">Yaratilgan sana</th>
                  <th className="py-3">Amallar</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-10 text-center text-slate-500 dark:text-slate-400">
                      Tanlangan filter bo'yicha talabalar topilmadi
                    </td>
                  </tr>
                ) : (
                  filtered.map((item) => (
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
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                            {visiblePasswordIds[item.id] ? item.adminPassword || 'Saqlanmagan' : '••••••••'}
                          </span>
                          <button
                            type="button"
                            onClick={() => setVisiblePasswordIds((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                            className="rounded-full border border-slate-200 p-2 text-slate-500 transition hover:bg-slate-50 hover:text-slate-700 dark:border-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-100"
                            aria-label="Parolni ko'rsatish yoki yashirish"
                          >
                            {visiblePasswordIds[item.id] ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        </div>
                      </td>
                      <td className="py-3 dark:text-slate-300">{formatDate(item.birth_date)}</td>
                      <td className="py-3">
                        <span className={`rounded-full px-3 py-1 text-xs ${getStatusBadgeClass(item.status)}`}>
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
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Qo'shish modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20">
          {/* ✅ modal dark mode */}
          <div className="h-full w-full max-w-md overflow-y-auto bg-white dark:bg-slate-800 p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold dark:text-white">Talaba qo'shish</h2>
              <button onClick={() => setOpen(false)} className="dark:text-white">✕</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <input className="w-full rounded-xl border px-4 py-3 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400" placeholder="Talaba FIO"
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
              <div>
                <label className="mb-1 block text-sm font-medium dark:text-slate-300">Tug'ilgan sana</label>
                <input type="date" className="w-full rounded-xl border px-4 py-3 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  value={form.birthDate}
                  onChange={(e) => setForm({ ...form, birthDate: e.target.value })} />
              </div>
              <input type="file" accept="image/*" className="dark:text-slate-300"
                onChange={(e) => setForm({ ...form, photo: e.target.files?.[0] || null })} />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setOpen(false)} className="rounded-xl border px-4 py-2 dark:border-slate-600 dark:text-white">Bekor qilish</button>
                <button type="submit" disabled={submitting} className="rounded-xl bg-violet-600 px-4 py-2 text-white disabled:opacity-50">
                  {submitting ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tahrirlash modal */}
      {editOpen && editStudent && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20">
          {/* ✅ modal dark mode */}
          <div className="h-full w-full max-w-md overflow-y-auto bg-white dark:bg-slate-800 p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold dark:text-white">Talabani tahrirlash</h2>
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
                    type={showPassword ? 'text' : 'password'}
                    className="w-full rounded-xl border px-4 py-3 pr-12 dark:bg-slate-700 dark:border-slate-600 dark:text-white dark:placeholder-slate-400"
                    placeholder="Parol kiriting"
                    value={editForm.password || ''}
                    onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-200"
                    aria-label="Parolni ko'rsatish yoki yashirish"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Admin shu maydonda parolni qo'lda o'rnatadi va brauzerda eslab qolinadi.
                </p>
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium dark:text-slate-300">Tug'ilgan sana</label>
                <input type="date" className="w-full rounded-xl border px-4 py-3 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                  value={editForm.birthDate}
                  onChange={(e) => setEditForm({ ...editForm, birthDate: e.target.value })} />
              </div>
              <input type="file" accept="image/*" className="dark:text-slate-300"
                onChange={(e) => setEditForm({ ...editForm, photo: e.target.files?.[0] || null })} />
              {error && <p className="text-sm text-red-500">{error}</p>}
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setEditOpen(false)} className="rounded-xl border px-4 py-2 dark:border-slate-600 dark:text-white">Bekor qilish</button>
                <button type="submit" disabled={submitting} className="rounded-xl bg-violet-600 px-4 py-2 text-white disabled:opacity-50">
                  {submitting ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}