import { api } from './axios';

export type CoursePayload = {
  name: string;
  durationMonth: number;
  durationLesson: number;
  price: number;
  description?: string;
  level?: string;
};

export const coursesApi = {
  async list(params?: Record<string, unknown>) {
    const { data } = await api.get('/course/all', { params });
    // ✅ Backend qanday struktura qaytarmasin — har doim array chiqadi
    return Array.isArray(data) ? data : (data?.data ?? data?.items ?? data ?? []);
  },
  async create(payload: CoursePayload) {
    const { data } = await api.post('/course', payload);
    return data;
  },
  async update(id: string, payload: Partial<CoursePayload>) {
    const { data } = await api.patch(`/course/${id}`, payload);
    return data;
  },
  async remove(id: string) {
    const { data } = await api.delete(`/course/${id}`);
    return data;
  },
};