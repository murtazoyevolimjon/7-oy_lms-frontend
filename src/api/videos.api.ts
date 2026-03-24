import { api } from './axios';

export const videosApi = {
  // GET /lesson-videos/:groupId
  async list(groupId: string) {
    const { data } = await api.get(`/lesson-videos/${groupId}`);
    return data;
  },

  // POST /lesson-videos (multipart: groupId, lessonId, file?)
  async upload(payload: { groupId: number; lessonId: number; file?: File | null }) {
    const formData = new FormData();
    formData.append('groupId', String(payload.groupId));
    formData.append('lessonId', String(payload.lessonId));
    if (payload.file) formData.append('file', payload.file);
    const { data } = await api.post('/lesson-videos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
};