import { api } from './axios';

export const studentGroupApi = {
  // POST /student-group — guruhga o'quvchi qo'shish
  async addStudent(payload: { groupId: number; studentId: number }) {
    const { data } = await api.post('/student-group', payload);
    return data;
  },
};