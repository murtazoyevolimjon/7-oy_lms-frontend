import { api } from './axios';

export const homeworkApi = {
  // GET /homework/group/:groupId
  async list(groupId: string) {
    const { data } = await api.get(`/homework/group/${groupId}`);
    return data;
  },

  async getByStatus(homeworkId: number, status: 'PENDING' | 'NOT_REVIEWED' | 'REJECTED' | 'APPROVED') {
    const { data } = await api.get(`/homework/${homeworkId}`, {
      params: { status },
    });
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
  async createResult(payload: { title: string; homeworkId: number; studentId: number; score: number }) {
    const { data } = await api.post('/homework-results', payload);
    return data;
  },
  async updateResult(id: number, payload: { title: string; homeworkId: number; studentId: number; score: number }) {
    const { data } = await api.put(`/homework-results/${id}`, payload);
    return data;
  },
};

export const fetchHomeworks = async () => {
  try {
    const response = await api.get('/homework');
    return response.data;
  } catch (error) {
    console.error('Error fetching homeworks:', error);
    throw error;
  }
};

export const deleteHomework = async (id: number) => {
  try {
    await api.delete(`/homework/${id}`);
  } catch (error) {
    console.error('Error deleting homework:', error);
    throw error;
  }
};