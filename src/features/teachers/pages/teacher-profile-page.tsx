import { useEffect, useState } from 'react';
import { teachersApi } from '@/api/teachers.api';
import { authStore } from '@/features/auth/store/auth.store';

type TeacherProfile = {
    id: number;
    fullName: string;
    email: string;
    experience: number | null;
    groupsCount: number;
    photo?: string | null;
};

export default function TeacherProfilePage() {
    const user = authStore.getUser();
    const [profile, setProfile] = useState<TeacherProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [tempPassword, setTempPassword] = useState('');
    const [resetLoading, setResetLoading] = useState(false);

    const loadProfile = async () => {
        setLoading(true);
        setError('');
        try {
            const res = await teachersApi.myProfile();
            setProfile(res?.data || res);
        } catch {
            setError("Profil ma'lumotlarini yuklashda xatolik");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async () => {
        setResetLoading(true);
        setError('');
        try {
            const res = await teachersApi.resetMyPassword();
            const data = res?.data || res;
            setTempPassword(data?.temporaryPassword || '');
        } catch {
            setError("Parolni yangilashda xatolik");
        } finally {
            setResetLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
    }, []);

    if (loading) {
        return <div className="py-12 text-center text-slate-400">Yuklanmoqda...</div>;
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-semibold text-slate-900">Profil</h1>
                <p className="text-sm text-slate-500">Shaxsiy ma'lumotlaringizni shu yerda ko'rasiz.</p>
            </div>

            {error && null}

            <div className="grid gap-6 xl:grid-cols-[320px_1fr]">
                <div className="rounded-3xl border border-slate-200 bg-white p-6">
                    <div className="flex flex-col items-center gap-3 text-center">
                        {profile?.photo ? (
                            <img src={profile.photo} alt="Teacher" className="h-24 w-24 rounded-full object-cover" />
                        ) : (
                            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-900 text-3xl font-semibold text-white">
                                {(profile?.fullName || user?.fullName || 'U')[0]}
                            </div>
                        )}
                        <div>
                            <p className="text-lg font-semibold text-slate-900">{profile?.fullName || user?.fullName || 'Teacher'}</p>
                            <p className="text-sm text-slate-500">O'qituvchi</p>
                        </div>
                    </div>
                    <div className="mt-6 space-y-3 text-sm text-slate-600">
                        <div className="flex items-center justify-between">
                            <span>Email</span>
                            <span className="font-medium text-slate-800">{profile?.email || user?.email || '-'}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Tajriba</span>
                            <span className="font-medium text-slate-800">{profile?.experience ?? 0} yil</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span>Guruhlar</span>
                            <span className="font-medium text-slate-800">{profile?.groupsCount ?? 0}</span>
                        </div>
                    </div>
                </div>

                <div className="rounded-3xl border border-slate-200 bg-white p-6">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Email</p>
                            <p className="mt-3 text-sm font-medium text-slate-900">{profile?.email || user?.email || '-'}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Tajriba</p>
                            <p className="mt-3 text-sm font-medium text-slate-900">{profile?.experience ?? 0} yil</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Guruhlar soni</p>
                            <p className="mt-3 text-sm font-medium text-slate-900">{profile?.groupsCount ?? 0}</p>
                        </div>
                        <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Parol</p>
                            <p className="mt-3 text-sm font-medium text-slate-900">{tempPassword || '••••••••'}</p>
                            <p className="mt-2 text-xs text-slate-500">Vaqtinchalik parol yaratish orqali ko'rinadi.</p>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap items-center gap-3">
                        <button
                            onClick={handleResetPassword}
                            disabled={resetLoading}
                            className="rounded-full bg-slate-900 px-5 py-2 text-sm text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                            {resetLoading ? 'Yangilanmoqda...' : 'Parolni yangilash'}
                        </button>
                        {tempPassword && (
                            <span className="text-sm text-emerald-600">Vaqtinchalik parol yaratildi</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
