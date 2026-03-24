import { api } from './axios';

export const lessonsApi = {
  // GET /lessons/:groupId — guruh darslari ro'yxati
  async list(groupId: string) {
    const { data } = await api.get(`/lessons/${groupId}`);
    return data;
  },

  // POST /lessons — yangi dars yaratish
  async create(payload: { groupId: number; title: string }) {
    const { data } = await api.post('/lessons', payload);
    return data;
  },
};