import { api } from './axios';

export const homeworkApi = {
  // GET /homework/group/:groupId
  async list(groupId: string) {
    const { data } = await api.get(`/homework/group/${groupId}`);
    return data;
  },

  // POST /homework  (multipart/form-data: title, groupId, lessonId, file?)
  async create(payload: { title: string; groupId: number; lessonId: number; file?: File | null }) {
    const formData = new FormData();
    formData.append('title', payload.title);
    formData.append('groupId', String(payload.groupId));
    formData.append('lessonId', String(payload.lessonId));
    if (payload.file) formData.append('file', payload.file);
    const { data } = await api.post('/homework', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};