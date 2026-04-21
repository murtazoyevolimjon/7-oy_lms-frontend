import { useEffect, useState } from 'react';
import { roomsApi } from '@/api/rooms.api';
import { groupsApi } from '@/api/groups.api';
import { BarChart3, Building2, Pencil, Sparkles, Trash2, Users } from 'lucide-react';

type Room = { id: string; name: string; capacity: number; status?: string };
type RoomFormState = { name: string; capacity: string };
type GroupStat = {
  id: number;
  name: string;
  roomName?: string | null;
  roomId?: number | string | null;
  studentsCount?: number;
};

type RoomUsage = {
  groups: GroupStat[];
  studentsCount: number;
};

const inputCls = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [groups, setGroups] = useState<GroupStat[]>([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [form, setForm] = useState<RoomFormState>({ name: '', capacity: '' });
  const [editForm, setEditForm] = useState<RoomFormState>({ name: '', capacity: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    const [roomsRes, groupsRes] = await Promise.all([roomsApi.list(), groupsApi.list()]);
    setRooms(roomsRes?.data || roomsRes || []);

    const groupsData = groupsRes?.data || groupsRes || [];
    setGroups(Array.isArray(groupsData) ? groupsData : []);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await roomsApi.create({
        name: form.name.trim(),
        capacity: Number(form.capacity),
      });
      setOpen(false);
      setForm({ name: '', capacity: '' });
      load();
    } catch (err: any) {
      const message = err?.response?.data?.message;
      setError(Array.isArray(message) ? message.join(', ') : message || 'Xato yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Xonani o'chirishni tasdiqlaysizmi?")) return;
    try {
      setDeleteId(id);
      await roomsApi.remove(id);
      load();
    } catch (err: any) {
      alert(err?.response?.data?.message || "O'chirishda xato");
    } finally {
      setDeleteId(null);
    }
  };

  const openEdit = (room: Room) => {
    setEditRoom(room);
    setEditForm({ name: room.name, capacity: String(room.capacity) });
    setEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRoom) return;
    setError('');
    setLoading(true);
    try {
      await roomsApi.update(editRoom.id, {
        name: editForm.name.trim(),
        capacity: Number(editForm.capacity),
      });
      setEditOpen(false);
      setEditRoom(null);
      load();
    } catch (err: any) {
      const message = err?.response?.data?.message;
      setError(Array.isArray(message) ? message.join(', ') : message || 'Xato yuz berdi');
    } finally {
      setLoading(false);
    }
  };

  const totalRooms = rooms.length;
  const totalCapacity = rooms.reduce((sum, room) => sum + Number(room.capacity || 0), 0);
  const activeRooms = rooms.filter((room) => (room.status || 'ACTIVE') === 'ACTIVE').length;
  const averageCapacity = totalRooms ? Math.round(totalCapacity / totalRooms) : 0;

  const roomUsageById = rooms.reduce<Record<string, RoomUsage>>((acc, room) => {
    const linkedGroups = groups.filter((group) => {
      const byId = String(group.roomId ?? '') === String(room.id);
      const byName = (group.roomName || '').trim().toLowerCase() === (room.name || '').trim().toLowerCase();
      return byId || byName;
    });

    const studentsCount = linkedGroups.reduce((sum, group) => sum + Number(group.studentsCount || 0), 0);
    acc[String(room.id)] = { groups: linkedGroups, studentsCount };
    return acc;
  }, {});

  const topRooms = [...rooms]
    .sort((a, b) => Number(b.capacity || 0) - Number(a.capacity || 0))
    .slice(0, 3);

  const getCapacityTier = (capacity: number) => {
    if (capacity >= 30) return { label: 'Katta', badge: 'bg-emerald-100 text-emerald-700' };
    if (capacity >= 20) return { label: "O'rta", badge: 'bg-sky-100 text-sky-700' };
    return { label: 'Kichik', badge: 'bg-amber-100 text-amber-700' };
  };

  const getLoadPercent = (capacity: number, currentStudents: number) => {
    const safeCapacity = Math.max(1, Number(capacity || 0));
    return Math.min(100, Math.round((Math.max(0, currentStudents) / safeCapacity) * 100));
  };

  const getProgressTone = (percent: number) => {
    if (percent >= 80) return 'bg-emerald-500';
    if (percent >= 60) return 'bg-sky-500';
    return 'bg-amber-500';
  };

  const getRecommendationLabel = (capacity: number, currentStudents: number) => {
    const safeCapacity = Math.max(1, Number(capacity || 0));
    const diff = safeCapacity - Math.max(0, currentStudents);

    if (currentStudents === 0) {
      return "Hozircha dars biriktirilmagan";
    }

    if (diff < 0) {
      return `${Math.abs(diff)} o'quvchi ortiqcha, kattaroq xona kerak`;
    }

    if (diff <= 3) {
      return "Xona deyarli to'lgan";
    }

    return `${diff} ta bo'sh joy mavjud`;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Xonalar</h1>
        <button
          onClick={() => setOpen(true)}
          className="rounded-xl bg-violet-600 px-4 py-3 text-white hover:bg-violet-700"
        >
          Xona qo'shish
        </button>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-slate-500 dark:border-gray-700 dark:text-slate-400">
                <th className="py-3">ID</th>
                <th className="py-3">Xona nomi</th>
                <th className="py-3">Sig'imi</th>
                <th className="py-3">Toifa</th>
                <th className="py-3">Tavsiya</th>
                <th className="py-3">Yuklama</th>
                <th className="py-3">Status</th>
                <th className="py-3">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {rooms.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400 dark:text-slate-500">
                    Xonalar mavjud emas
                  </td>
                </tr>
              ) : (
                rooms.map((room) => {
                  const tier = getCapacityTier(Number(room.capacity || 0));
                  const roomUsage = roomUsageById[String(room.id)] || { groups: [], studentsCount: 0 };
                  const loadPercent = getLoadPercent(Number(room.capacity || 0), roomUsage.studentsCount);
                  const progressTone = getProgressTone(loadPercent);
                  const recommendation = getRecommendationLabel(Number(room.capacity || 0), roomUsage.studentsCount);
                  const groupsLabel = roomUsage.groups.length
                    ? roomUsage.groups.map((group) => group.name).join(', ')
                    : "Guruh biriktirilmagan";

                  return (
                    <tr key={room.id} className="border-b border-gray-100 hover:bg-slate-50 dark:border-gray-700 dark:hover:bg-gray-700">
                      <td className="py-3 text-slate-400 dark:text-slate-500">#{room.id}</td>
                      <td className="py-3 font-medium text-gray-900 dark:text-white">{room.name}</td>
                      <td className="py-3 text-gray-700 dark:text-gray-300">{room.capacity} kishi</td>
                      <td className="py-3">
                        <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tier.badge}`}>
                          {tier.label}
                        </span>
                      </td>
                      <td className="py-3 text-gray-700 dark:text-gray-300">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-slate-700">{recommendation}</p>
                          <p className="text-xs text-slate-500">{groupsLabel}</p>
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="w-36">
                          <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
                            <span>Bandlik</span>
                            <span>{loadPercent}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-slate-200">
                            <div
                              className={`h-2 rounded-full ${progressTone}`}
                              style={{ width: `${loadPercent}%` }}
                            />
                          </div>
                          <p className="mt-1 text-[11px] text-slate-500">
                            {roomUsage.studentsCount}/{room.capacity} o'quvchi
                          </p>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className="rounded-full bg-green-100 px-3 py-1 text-xs text-green-700 dark:bg-green-900/30 dark:text-green-400">
                          {room.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => openEdit(room)}
                            className="flex items-center gap-1 rounded-lg border border-blue-200 px-3 py-1 text-sm text-blue-500 hover:bg-blue-50 dark:border-blue-800 dark:hover:bg-blue-900/20"
                          >
                            <Pencil size={14} /> Tahrirlash
                          </button>
                          <button
                            onClick={() => handleDelete(room.id)}
                            disabled={deleteId === room.id}
                            className="flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1 text-sm text-red-500 hover:bg-red-50 disabled:opacity-50 dark:border-red-800 dark:hover:bg-red-900/20"
                          >
                            <Trash2 size={14} /> {deleteId === room.id ? '...' : "O'chirish"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="glass-panel rounded-2xl border border-white/80 p-5">
          <div className="mb-2 inline-flex rounded-xl bg-sky-100 p-2 text-sky-600">
            <Building2 size={18} />
          </div>
          <p className="text-sm text-slate-500">Jami xonalar</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{totalRooms}</p>
        </div>

        <div className="glass-panel rounded-2xl border border-white/80 p-5">
          <div className="mb-2 inline-flex rounded-xl bg-emerald-100 p-2 text-emerald-600">
            <Sparkles size={18} />
          </div>
          <p className="text-sm text-slate-500">Faol xonalar</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{activeRooms}</p>
        </div>

        <div className="glass-panel rounded-2xl border border-white/80 p-5">
          <div className="mb-2 inline-flex rounded-xl bg-violet-100 p-2 text-violet-600">
            <Users size={18} />
          </div>
          <p className="text-sm text-slate-500">Umumiy sig'im</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{totalCapacity}</p>
        </div>

        <div className="glass-panel rounded-2xl border border-white/80 p-5">
          <div className="mb-2 inline-flex rounded-xl bg-amber-100 p-2 text-amber-600">
            <BarChart3 size={18} />
          </div>
          <p className="text-sm text-slate-500">O'rtacha sig'im</p>
          <p className="mt-1 text-3xl font-bold text-slate-900">{averageCapacity}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.25fr_1fr]">
        <div className="glass-panel rounded-2xl border border-white/80 p-5">
          <h3 className="text-lg font-bold text-slate-900">Top xonalar</h3>
          <p className="mt-1 text-sm text-slate-500">Sig'imi bo'yicha eng katta xonalar ro'yxati</p>

          <div className="mt-4 space-y-3">
            {topRooms.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-white/70 p-4 text-sm text-slate-500">
                Hozircha xonalar qo'shilmagan.
              </div>
            ) : (
              topRooms.map((room, index) => (
                <div
                  key={room.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 bg-white/80 px-4 py-3"
                >
                  <div>
                    <p className="font-semibold text-slate-900">#{index + 1} {room.name}</p>
                    <p className="text-xs text-slate-500">ID: {room.id}</p>
                  </div>
                  <span className="rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-700">
                    {room.capacity} kishi
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-sky-200 bg-gradient-to-br from-sky-500 to-cyan-600 p-5 text-white shadow-lg">
          <h3 className="text-lg font-bold">Xonalar bo'yicha tavsiya</h3>
          <p className="mt-2 text-sm text-white/90">
            Jadvalni balans qilish uchun katta sig'imli xonalarni ko'p talab bo'ladigan guruhlarga biriktiring.
          </p>

          <div className="mt-4 rounded-xl bg-white/15 p-4 backdrop-blur">
            <p className="text-xs uppercase tracking-[0.18em] text-white/80">Monitoring</p>
            <p className="mt-2 text-2xl font-bold">{activeRooms}/{totalRooms || 0}</p>
            <p className="text-sm text-white/90">faol xona holati</p>
          </div>
        </div>
      </div>

      {/* Qo'shish modal */}
      {open && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20">
          <div className="h-full w-full max-w-md overflow-y-auto bg-white p-5 shadow-2xl dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Xona qo'shish</h2>
              <button
                onClick={() => setOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >✕</button>
            </div>
            <form onSubmit={handleCreate} className="space-y-4">
              <input
                className={inputCls}
                placeholder="Xona nomi"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
              <input
                type="number"
                className={inputCls}
                placeholder="Sig'imi"
                value={form.capacity}
                onChange={(e) => setForm({ ...form, capacity: e.target.value })}
              />
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
                  className="rounded-xl bg-violet-600 px-4 py-2 text-white hover:bg-violet-700 disabled:opacity-50"
                >
                  {loading ? 'Saqlanmoqda...' : 'Saqlash'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Tahrirlash modal */}
      {editOpen && editRoom && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/20">
          <div className="h-full w-full max-w-md overflow-y-auto bg-white p-5 shadow-2xl dark:bg-gray-900">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Xonani tahrirlash</h2>
              <button
                onClick={() => setEditOpen(false)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >✕</button>
            </div>
            <form onSubmit={handleEdit} className="space-y-4">
              <input
                className={inputCls}
                placeholder="Xona nomi"
                value={editForm.name}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              />
              <input
                type="number"
                className={inputCls}
                placeholder="Sig'imi"
                value={editForm.capacity}
                onChange={(e) => setEditForm({ ...editForm, capacity: e.target.value })}
              />
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
                  className="rounded-xl bg-violet-600 px-4 py-2 text-white hover:bg-violet-700 disabled:opacity-50"
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