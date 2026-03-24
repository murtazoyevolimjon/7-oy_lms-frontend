import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '@/api/auth.api';
import { authStore } from '../store/auth.store';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
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
      const res = await authApi.login(form);
      authStore.setToken(res.accessToken);
      authStore.setUser(res.user);
      navigate('/');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Login xatoligi');
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
        <form onSubmit={onSubmit} className="w-full max-w-md space-y-5 rounded-2xl border border-slate-200 p-8 shadow-sm">
          <div>
            <h1 className="text-3xl font-bold">Tizimga kirish</h1>
            <p className="mt-1 text-sm text-slate-500">Hisobingizga kiring</p>
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Email</label>
            <input
              className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-violet-200"
              placeholder="Emailni kiriting"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium">Parol</label>
            <input
              type="password"
              className="w-full rounded-xl border px-4 py-3 outline-none focus:ring-2 focus:ring-violet-200"
              placeholder="Parolni kiriting"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
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
  );
}