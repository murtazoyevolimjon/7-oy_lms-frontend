import { useEffect, useState } from 'react';
import { roomsApi, type RoomPayload } from '@/api/rooms.api';
import { Pencil, Trash2 } from 'lucide-react';

type Room = { id: string; name: string; capacity: number; status?: string };

const inputCls = "w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-gray-900 placeholder-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-500";

export default function RoomsPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [open, setOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editRoom, setEditRoom] = useState<Room | null>(null);
  const [form, setForm] = useState<RoomPayload>({ name: '', capacity: 0 });
  const [editForm, setEditForm] = useState<Partial<RoomPayload>>({ name: '', capacity: 0 });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const load = async () => {
    const res = await roomsApi.list();
    setRooms(res?.data || res || []);
  };

  useEffect(() => { load(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await roomsApi.create(form);
      setOpen(false);
      setForm({ name: '', capacity: 0 });
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
    setEditForm({ name: room.name, capacity: room.capacity });
    setEditOpen(true);
  };

  const handleEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editRoom) return;
    setError('');
    setLoading(true);
    try {
      await roomsApi.update(editRoom.id, editForm);
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
                <th className="py-3">Status</th>
                <th className="py-3">Amallar</th>
              </tr>
            </thead>
            <tbody>
              {rooms.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-slate-400 dark:text-slate-500">
                    Xonalar mavjud emas
                  </td>
                </tr>
              ) : (
                rooms.map((room) => (
                  <tr key={room.id} className="border-b border-gray-100 hover:bg-slate-50 dark:border-gray-700 dark:hover:bg-gray-700">
                    <td className="py-3 text-slate-400 dark:text-slate-500">#{room.id}</td>
                    <td className="py-3 font-medium text-gray-900 dark:text-white">{room.name}</td>
                    <td className="py-3 text-gray-700 dark:text-gray-300">{room.capacity} kishi</td>
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
                onChange={(e) => setForm({ ...form, capacity: Number(e.target.value) })}
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
                onChange={(e) => setEditForm({ ...editForm, capacity: Number(e.target.value) })}
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