import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth.api';
import { authStore } from '../store/auth.store';
import { Eye, EyeOff } from 'lucide-react';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(true);
  const [role, setRole] = useState<'admin' | 'teacher' | 'student'>('admin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!form.email || !form.password) {
      setError('Email va parol majburiy');
      return;
    }
    try {
      setLoading(true);
      const res = role === 'student'
        ? await authApi.loginStudent(form)
        : role === 'teacher'
          ? await authApi.loginTeacher(form)
          : await authApi.loginAdmin(form);

      const resolvedRole = String(res.user?.role || '').toUpperCase();
      const redirectPath = resolvedRole === 'STUDENT'
        ? '/student/dashboard'
        : resolvedRole === 'TEACHER'
          ? '/teacher/dashboard'
          : '/admin/dashboard';

      authStore.setToken(res.accessToken);
      authStore.setUser(res.user);
      authStore.setRole(
        resolvedRole || (role === 'student' ? 'STUDENT' : role === 'teacher' ? 'TEACHER' : 'ADMIN'),
      );
      navigate(redirectPath, { replace: true });
    } catch (err: any) {
      const message = err?.response?.data?.message;
      setError(Array.isArray(message) ? message.join(', ') : message || 'Login xatoligi');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div
        className="hidden bg-cover bg-center lg:block"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1600&auto=format&fit=crop')",
        }}
      />
      <div className="flex items-center justify-center bg-white px-6">
        <div className="w-full max-w-md space-y-6">
          <h2 className="text-center text-5xl font-semibold text-slate-500">Najot ta'lim</h2>
          <form onSubmit={onSubmit} className="w-full space-y-5 rounded-2xl border border-slate-200 p-8 shadow-sm">
            <div>
              <h1 className="text-3xl font-bold">Tizimga kirish</h1>
              <p className="mt-1 text-sm text-slate-500">Hisobingizga kiring</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Rol</label>
              <div className="grid grid-cols-3 gap-2 rounded-xl bg-slate-100 p-1">
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${role === 'admin'
                    ? 'bg-violet-600 text-white'
                    : 'text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${role === 'teacher'
                    ? 'bg-violet-600 text-white'
                    : 'text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  Teacher
                </button>
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`rounded-lg px-3 py-2 text-sm font-medium transition ${role === 'student'
                    ? 'bg-violet-600 text-white'
                    : 'text-slate-600 hover:bg-slate-200'
                    }`}
                >
                  Student
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Login</label>
              <input
                className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-violet-200"
                placeholder="Loginni kiriting"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-2 block text-sm font-medium">Parol</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  className="w-full rounded-xl border px-4 py-3 pr-12 outline-none focus:ring-2 focus:ring-violet-200"
                  placeholder="Parolni kiriting"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                  aria-label="Parolni ko'rsatish yoki yashirish"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-xl bg-violet-600 px-4 py-3 font-medium text-white disabled:opacity-50"
            >
              {loading ? 'Kirilmoqda...' : 'Kirish'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}