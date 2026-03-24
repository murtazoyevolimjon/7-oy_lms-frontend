import { api } from './axios';

export const attendanceApi = {
  // GET /attendance/:lessonId — dars davomati
  async getByLesson(lessonId: number) {
    const { data } = await api.get(`/attendance/${lessonId}`);
    return data;
  },

  // POST /attendance — davomat qo'shish
  async create(payload: { lessonId: number; studentId: number; isPresent: boolean }) {
    const { data } = await api.post('/attendance', payload);
    return data;
  },
};