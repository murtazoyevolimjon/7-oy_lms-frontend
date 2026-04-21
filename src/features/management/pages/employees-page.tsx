import { useEffect, useState } from 'react';
import { employeesApi } from '@/api/employees.api';
import { formatDate } from '@/lib/utils';
import { Eye, EyeOff, Pencil, Trash2 } from 'lucide-react';

type Employee = {
  id: string;
  fullName: string;
  role: string;
  email: string;
  password?: string;
  created_at: string;
  status?: string;
};

type FormState = {
  fullName: string;
  email: string;
  password: string;
  position: string;
  hire_date: string;
  role: string;
  photo: File | null;
};

const ROLES = ['SUPERADMIN', 'ADMIN', 'STUDENT', 'TEACHER', 'MANAGEMENT', 'ADMINSTRATOR'];

const inputCls = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500";
const labelCls = "mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300";

export default function EmployeesPage() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editEmployee, setEditEmployee] = useState<Employee | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showCreatePassword, setShowCreatePassword] = useState(true);
  const [showEditPassword, setShowEditPassword] = useState(true);

  const [form, setForm] = useState<FormState>({
    fullName: '', email: '', password: '', position: '', hire_date: '', role: '', photo: null,
  });

  const [editForm, setEditForm] = useState<Partial<FormState>>({
    fullName: '', email: '', position: '', role: '', password: '',
  });

  const load = async () => {
    const res = await employeesApi.list();
    setEmployees(res?.data || res || []);
  };

  useEffect(() => { load(); }, []);

  const parseApiError = (err: any, fallback = 'Xato yuz berdi') => {
    const raw = err?.response?.data?.message ?? err?.message;
    if (Array.isArray(raw)) return raw.join(', ');
    if (typeof raw === 'string') return raw;
    return fallback;
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await employeesApi.create(form);
      setOpen(false);
      setForm({ fullName: '', email: '', password: '', position: '', hire_date: '', role: '', photo: null });
      load();
    } catch (err: any) {
      setError(parseApiError(err, 'Xodim yaratishda xato'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xodimni o'chirishni tasdiqlaysizmi?")) return;
    try {
      setDeleteId(id);
      await employeesApi.remove(id);
      load();
    } catch (err: any) {
      alert(err?.response?.data?.message || "O'chirishda xato");
    } finally {
      setDeleteId(null);
    }
  };

  const openEdit = (employee: Employee) => {
    setEditEmployee(employee);
    setEditForm({ fullName: employee.fullName, email: employee.email, role: employee.role, password: '' });
    setShowEditPassword(true);
    setEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editEmployee) return;
    setError('');
    setLoading(true);
    try {
      await employeesApi.update(editEmployee.id, editForm);
      setEditOpen(false);
      setEditEmployee(null);
      load();
    } catch (err: any) {
      setError(parseApiError(err, 'Xodimni tahrirlashda xato'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Xodimlar</h1>
        <button
          onClick={() => setOpen(true)}
          className="rounded-xl bg-violet-600 px-4 py-3 text-white hover:bg-violet-700"
        >
          Xodim qo'shish
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-slate-500 dark:border-gray-700 dark:text-slate-400">
                <th className="py-3">ID</th>
                <th className="py-3">Nomi</th>
                <th className="py-3">Email</th>
                <th className="py-3">Lavozim</th>
                <th className="py-3">Status</th>
                <th className="py-3">Yaratilgan sana</th>
                <th className="py-3">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400 dark:text-slate-500">
                    Xodimlar mavjud emas
                  </td>
                </tr>
              ) : (
                employees.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100 hover:bg-slate-50 dark:border-gray-700 dark:hover:bg-gray-700">
                    <td className="py-3 text-slate-400 dark:text-slate-500">#{item.id}</td>
                    <td className="py-3 font-medium text-gray-900 dark:text-white">{item.fullName}</td>
                    <td className="py-3 text-gray-700 dark:text-gray-300">{item.email}</td>
                    <td className="py-3 text-gray-700 dark:text-gray-300">{item.role}</td>
                    <td className="py-3">
                      <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        {item.status || 'ACTIVE'}
                      </span>
                    </td>
                    <td className="py-3 text-gray-700 dark:text-gray-300">{formatDate(item.created_at)}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(item)}
                          className="flex items-center gap-1 rounded-lg border border-blue-200 px-3 py-1 text-sm text-blue-500 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/20"
                        >
                          <Pencil size={14} /> Tahrirlash
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deleteId === item.id}
                          className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1 text-sm text-red-500 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:hover:bg-red-900/20"
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
      </div>

      {/* Qo'shish modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20">
          <div className="h-full w-full max-w-md overflow-y-auto bg-white p-5 shadow-2xl dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Xodim qo'shish</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >✕</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className={labelCls}>FIO</label>
                <input className={inputCls} placeholder="To'liq ism"
                  value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input className={inputCls} placeholder="Email"
                  value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>Lavozim</label>
                <input className={inputCls} placeholder="Lavozim (position)"
                  value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>Role</label>
                <select className={inputCls}
                  value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
                  <option value="">Role tanlang</option>
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className={labelCls}>Ishga kirgan sana</label>
                <input type="date" className={inputCls}
                  value={form.hire_date} onChange={(e) => setForm({ ...form, hire_date: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>Parol</label>
                <div className="relative">
                  <input
                    type={showCreatePassword ? 'text' : 'password'}
                    className={`${inputCls} pr-12`}
                    placeholder="Parol"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                  />
                  <button
                    type="button"
                    onClick={() => setShowCreatePassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600 dark:hover:text-gray-200"
                    aria-label="Parolni ko'rsatish yoki yashirish"
                  >
                    {showCreatePassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
              <div>
                <label className={labelCls}>Rasm</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full text-sm text-gray-700 dark:text-gray-300 file:mr-3 file:rounded-lg file:border-0 file:bg-violet-50 file:px-3 file:py-2 file:text-sm file:text-violet-700 dark:file:bg-violet-900/30 dark:file:text-violet-400"
                  onChange={(e) => setForm({ ...form, photo: e.target.files?.[0] || null })}
                />
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
      {editOpen && editEmployee && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20">
          <div className="h-full w-full max-w-md overflow-y-auto bg-white p-5 shadow-2xl dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Xodimni tahrirlash</h2>
              <button
                onClick={() => setEditOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >✕</button>
            </div>
            <form onSubmit={handleEdit} className="space-y-4">
              <div>
                <label className={labelCls}>FIO</label>
                <input className={inputCls} placeholder="To'liq ism"
                  value={editForm.fullName} onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>Email</label>
                <input className={inputCls} placeholder="Email"
                  value={editForm.email} onChange={(e) => setEditForm({ ...editForm, email: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>Lavozim</label>
                <input className={inputCls} placeholder="Lavozim (position)"
                  value={editForm.position} onChange={(e) => setEditForm({ ...editForm, position: e.target.value })} />
              </div>
              <div>
                <label className={labelCls}>Role</label>
                <select className={inputCls}
                  value={editForm.role} onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}>
                  <option value="">Role tanlang</option>
                  {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>
              {editEmployee.role === 'SUPERADMIN' && (
                <div>
                  <label className={labelCls}>Parol</label>
                  <div className="relative">
                    <input
                      type={showEditPassword ? 'text' : 'password'}
                      className={`${inputCls} pr-12`}
                      placeholder="Yangi parol kiriting"
                      value={editForm.password || ''}
                      onChange={(e) => setEditForm({ ...editForm, password: e.target.value })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowEditPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 transition hover:text-gray-600 dark:hover:text-gray-200"
                      aria-label="Parolni ko'rsatish yoki yashirish"
                    >
                      {showEditPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>
              )}
              <div>
                <label className={labelCls}>Rasm</label>
                <input
                  type="file"
                  accept="image/*"
                  className="w-full text-sm text-gray-700 dark:text-gray-300 file:mr-3 file:rounded-lg file:border-0 file:bg-violet-50 file:px-3 file:py-2 file:text-sm file:text-violet-700 dark:file:bg-violet-900/30 dark:file:text-violet-400"
                  onChange={(e) => setEditForm({ ...editForm, photo: e.target.files?.[0] || null })}
                />
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