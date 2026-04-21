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
    <div className="ambient-grid grid min-h-screen grid-cols-1 lg:grid-cols-2">
      <div
        className="relative hidden overflow-hidden lg:block"
        style={{
          backgroundImage:
            "linear-gradient(130deg, rgba(8,47,73,0.70), rgba(14,116,144,0.58), rgba(234,88,12,0.38)), url('https://images.unsplash.com/photo-1497366754035-f200968a6e72?q=80&w=1600&auto=format&fit=crop')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(255,255,255,.25),transparent_32%),radial-gradient(circle_at_86%_84%,rgba(255,255,255,.18),transparent_30%)]" />
        <div className="relative z-10 flex h-full items-end p-10">
          <div className="max-w-lg rounded-3xl border border-white/30 bg-white/12 p-8 text-white backdrop-blur-md">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-white/80">Education CRM</p>
            <h2 className="text-4xl font-bold leading-tight">Kuchli jamoa uchun zamonaviy boshqaruv paneli</h2>
            <p className="mt-4 text-sm text-white/85">
              O'qituvchi, talaba va administratorlar uchun bir xil sifatdagi boshqaruv tajribasi.
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center px-5 py-8 sm:px-8">
        <div className="w-full max-w-md space-y-6 animate-fade-up">
          <div className="text-center">
            <h2 className="text-5xl font-semibold brand-gradient-text">Najot ta'lim</h2>
            <p className="mt-2 text-sm text-slate-600">CRM tizimiga kirish</p>
          </div>

          <form onSubmit={onSubmit} className="glass-panel lift-on-hover w-full space-y-5 rounded-3xl border border-white/85 p-8">
            <div>
              <h1 className="text-3xl font-bold">Tizimga kirish</h1>
              <p className="mt-1 text-sm text-slate-500">Hisobingizga kiring</p>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Rol</label>
              <div className="grid grid-cols-3 gap-2 rounded-2xl bg-white/80 p-1.5 shadow-inner">
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${role === 'admin'
                    ? 'brand-gradient text-white shadow'
                    : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${role === 'teacher'
                    ? 'brand-gradient text-white shadow'
                    : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  Teacher
                </button>
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`rounded-xl px-3 py-2 text-sm font-semibold transition ${role === 'student'
                    ? 'brand-gradient text-white shadow'
                    : 'text-slate-600 hover:bg-slate-100'
                    }`}
                >
                  Student
                </button>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Login</label>
              <input
                className="w-full rounded-2xl border border-white/80 bg-white/85 px-4 py-3 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
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
                  className="w-full rounded-2xl border border-white/80 bg-white/85 px-4 py-3 pr-12 outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
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
              className="brand-gradient w-full rounded-2xl px-4 py-3 font-semibold text-white shadow-md shadow-sky-500/25 disabled:opacity-50"
            >
              {loading ? 'Kirilmoqda...' : 'Kirish'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}