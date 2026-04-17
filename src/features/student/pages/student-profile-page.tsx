import { useMemo, useState } from 'react';
import { authStore } from '@/features/auth/store/auth.store';
import { Eye, EyeOff, Pencil, X } from 'lucide-react';

type NotificationSettings = {
    newExams: boolean;
    examAnnouncements: boolean;
    examDeadlineReminder: boolean;
    newHomeworks: boolean;
    homeworkReviewed: boolean;
    homeworkDeadlineReminder: boolean;
    addedToGroup: boolean;
    removedFromGroup: boolean;
    xpAwarded: boolean;
};

const DEFAULT_NOTIFICATION_SETTINGS: NotificationSettings = {
    newExams: true,
    examAnnouncements: true,
    examDeadlineReminder: true,
    newHomeworks: true,
    homeworkReviewed: true,
    homeworkDeadlineReminder: true,
    addedToGroup: true,
    removedFromGroup: true,
    xpAwarded: true,
};

const NOTIFICATION_STORAGE_KEY = 'studentNotificationSettings';

const notificationLabels: Record<keyof NotificationSettings, string> = {
    newExams: 'Yangi imtihonlar',
    examAnnouncements: "Imtihon e'loni",
    examDeadlineReminder: 'Imtihon vazifa muddati yaqin qolsa',
    newHomeworks: 'Yangi uy vazifalar',
    homeworkReviewed: 'Uy vazifa tekshirilganda',
    homeworkDeadlineReminder: 'Uy vazifa muddati yaqin qolsa',
    addedToGroup: "Guruhga qo'shilganlik",
    removedFromGroup: "Guruhda o'qishni to'xtatganlik",
    xpAwarded: 'XP, Kumush taqdim etilganda',
};

const getStoredNotificationSettings = (): NotificationSettings => {
    const raw = localStorage.getItem(NOTIFICATION_STORAGE_KEY);
    if (!raw) return DEFAULT_NOTIFICATION_SETTINGS;

    try {
        const parsed = JSON.parse(raw) as Partial<NotificationSettings>;
        return {
            ...DEFAULT_NOTIFICATION_SETTINGS,
            ...parsed,
        };
    } catch {
        return DEFAULT_NOTIFICATION_SETTINGS;
    }
};

export default function StudentProfilePage() {
    const user = authStore.getUser();
    const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
    const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const [passwordForm, setPasswordForm] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [showPassword, setShowPassword] = useState({
        oldPassword: true,
        newPassword: true,
        confirmPassword: true,
    });

    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(
        () => getStoredNotificationSettings(),
    );

    const { firstName, lastName } = useMemo(() => {
        const fullName = user?.fullName?.trim() || 'Student User';
        const parts = fullName.split(/\s+/);
        if (parts.length === 1) {
            return { firstName: parts[0], lastName: 'Mavjud emas' };
        }

        return {
            firstName: parts[0],
            lastName: parts.slice(1).join(' '),
        };
    }, [user?.fullName]);

    const openPasswordModal = () => {
        setError('');
        setMessage('');
        setIsPasswordModalOpen(true);
    };

    const openNotificationModal = () => {
        setError('');
        setMessage('');
        setIsNotificationModalOpen(true);
    };

    const handlePasswordSave = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        if (!passwordForm.oldPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
            setError("Barcha maydonlarni to'ldiring");
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            setError('Yangi parol kamida 6 ta belgidan iborat bo‘lishi kerak');
            return;
        }

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setError('Yangi parol va tasdiqlash bir xil emas');
            return;
        }

        setIsPasswordModalOpen(false);
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setMessage("Parolni o'zgartirish so'rovi yuborildi");
    };

    const handleNotificationSave = (e: React.FormEvent) => {
        e.preventDefault();
        localStorage.setItem(NOTIFICATION_STORAGE_KEY, JSON.stringify(notificationSettings));
        setIsNotificationModalOpen(false);
        setMessage('Bildirishnoma sozlamalari saqlandi');
    };

    const toggleNotification = (key: keyof NotificationSettings) => {
        setNotificationSettings((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const hhId = user?.id || '30871';

    return (
        <div className="space-y-6">
            {message && (
                <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
                    {message}
                </div>
            )}

            <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm lg:p-7">
                <h2 className="text-4xl font-medium text-slate-800">Shaxsiy ma'lumotlar</h2>

                <div className="mt-7 grid gap-7 xl:grid-cols-[520px_1fr]">
                    <div className="grid gap-6 sm:grid-cols-2">
                        <div>
                            <div className="mb-3 flex h-56 items-center justify-center rounded-2xl border border-slate-300 bg-slate-100 text-slate-500">
                                <img
                                    src="https://images.unsplash.com/photo-1568602471122-7832951cc4c5?q=80&w=640&auto=format&fit=crop"
                                    alt="Namuna"
                                    className="h-full w-full rounded-2xl object-cover"
                                />
                            </div>
                            <p className="text-center text-2xl font-medium text-slate-700">Namuna</p>
                            <p className="mt-4 text-lg text-slate-600">500x500 o`lcham, JPEG, JPG, PNG format, maximum 2MB</p>
                        </div>

                        <div className="flex flex-col items-center justify-start gap-4">
                            {user?.avatar ? (
                                <img src={user.avatar} alt={user.fullName} className="h-44 w-44 rounded-full border border-slate-200 object-cover" />
                            ) : (
                                <div className="flex h-44 w-44 items-center justify-center rounded-full bg-slate-200 text-5xl font-semibold text-slate-600">
                                    {(user?.fullName?.charAt(0) || 'S').toUpperCase()}
                                </div>
                            )}
                            <span className="rounded-lg bg-emerald-500 px-3 py-1 text-sm font-semibold text-white">Talabga mos</span>
                        </div>
                    </div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        <div className="space-y-6">
                            <div>
                                <p className="text-lg text-slate-500">Ism</p>
                                <p className="text-4xl font-medium text-slate-800">{firstName}</p>
                            </div>
                            <div>
                                <p className="text-lg text-slate-500">Telefon raqam</p>
                                <p className="text-4xl font-medium text-slate-800">(+998) 88 579 03 09</p>
                            </div>
                            <div>
                                <p className="text-lg text-slate-500">Jinsi</p>
                                <p className="text-4xl font-medium text-slate-800">Male</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <p className="text-lg text-slate-500">Surname</p>
                                <p className="text-4xl font-medium text-slate-800">{lastName}</p>
                            </div>
                            <div>
                                <p className="text-lg text-slate-500">Tug'ilgan sana</p>
                                <p className="text-4xl font-medium text-slate-800">September 3, 2005</p>
                            </div>
                            <div>
                                <p className="text-lg text-slate-500">HH ID</p>
                                <p className="text-4xl font-medium text-slate-800">{hhId}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <div className="grid gap-6 md:grid-cols-3">
                <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <h3 className="mb-8 text-4xl font-medium text-slate-800">Kirish</h3>
                    <p className="text-4xl font-medium text-slate-800">{hhId}</p>
                </article>

                <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-8 flex items-start justify-between gap-2">
                        <h3 className="text-4xl font-medium text-slate-800">Password</h3>
                        <button
                            onClick={openPasswordModal}
                            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                            aria-label="Parolni tahrirlash"
                        >
                            <Pencil size={20} />
                        </button>
                    </div>
                    <p className="text-5xl leading-none text-slate-800">••••••••</p>
                </article>

                <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                    <div className="mb-8 flex items-start justify-between gap-2">
                        <h3 className="text-4xl font-medium text-slate-800">Bildirishnoma sozlamalari</h3>
                        <button
                            onClick={openNotificationModal}
                            className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-700"
                            aria-label="Bildirishnoma sozlamalarini tahrirlash"
                        >
                            <Pencil size={20} />
                        </button>
                    </div>
                    <p className="text-lg text-slate-500">Yoqish/O‘chirish sozlamalarini boshqarish</p>
                </article>
            </div>

            <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h3 className="mb-4 text-4xl font-medium text-slate-800">Shartnomalarim</h3>
                <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-lg text-slate-600">
                    Samarqand | ESKI Bootcamp Contract.pdf
                </div>
            </section>

            {isPasswordModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h4 className="text-3xl font-medium text-slate-800">Parolni o'zgartirish</h4>
                            <button
                                onClick={() => setIsPasswordModalOpen(false)}
                                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"
                                aria-label="Yopish"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        <p className="mb-5 text-lg text-slate-600">Quyidagi ma'lumotlarni to'ldiring</p>

                        <form className="space-y-4" onSubmit={handlePasswordSave}>
                            {([
                                { key: 'oldPassword', label: 'Amaldagi parol' },
                                { key: 'newPassword', label: 'Yangi parol' },
                                { key: 'confirmPassword', label: 'Parolni tasdiqlash' },
                            ] as const).map((field) => (
                                <div key={field.key}>
                                    <label className="mb-2 block text-lg text-slate-600">{field.label}</label>
                                    <div className="relative">
                                        <input
                                            type={showPassword[field.key] ? 'text' : 'password'}
                                            placeholder="Parolingizni kiriting"
                                            className="w-full rounded-xl border border-slate-200 px-4 py-3 pr-12 text-lg outline-none transition focus:border-amber-400"
                                            value={passwordForm[field.key]}
                                            onChange={(e) =>
                                                setPasswordForm((prev) => ({
                                                    ...prev,
                                                    [field.key]: e.target.value,
                                                }))
                                            }
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setShowPassword((prev) => ({
                                                    ...prev,
                                                    [field.key]: !prev[field.key],
                                                }))
                                            }
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                                            aria-label="Parolni ko'rsatish"
                                        >
                                            {showPassword[field.key] ? <EyeOff size={20} /> : <Eye size={20} />}
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {error && (
                                <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-600">
                                    {error}
                                </div>
                            )}

                            <button
                                type="submit"
                                className="mt-2 w-full rounded-xl bg-amber-600 px-4 py-3 text-lg font-semibold text-white transition hover:bg-amber-700"
                            >
                                Saqlash
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {isNotificationModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
                    <div className="w-full max-w-xl rounded-2xl bg-white p-5 shadow-2xl">
                        <div className="mb-4 flex items-center justify-between">
                            <h4 className="text-3xl font-medium text-slate-800">Bildirishnoma sozlamalari</h4>
                            <button
                                onClick={() => setIsNotificationModalOpen(false)}
                                className="rounded-xl p-2 text-slate-500 transition hover:bg-slate-100"
                                aria-label="Yopish"
                            >
                                <X size={22} />
                            </button>
                        </div>

                        <form className="space-y-3" onSubmit={handleNotificationSave}>
                            {(Object.keys(notificationSettings) as Array<keyof NotificationSettings>).map((key) => (
                                <label key={key} className="flex cursor-pointer items-center gap-3 rounded-xl px-1 py-1 text-xl text-slate-700">
                                    <input
                                        type="checkbox"
                                        checked={notificationSettings[key]}
                                        onChange={() => toggleNotification(key)}
                                        className="h-5 w-5 rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                                    />
                                    <span>{notificationLabels[key]}</span>
                                </label>
                            ))}

                            <button
                                type="submit"
                                className="mt-2 w-full rounded-xl bg-amber-600 px-4 py-3 text-lg font-semibold text-white transition hover:bg-amber-700"
                            >
                                Saqlash
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
