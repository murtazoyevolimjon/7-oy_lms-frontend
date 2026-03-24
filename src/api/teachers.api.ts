import { api } from './axios';

export type TeacherPayload = {
  fullName: string;
  email: string;
  password: string;
  position: string;
  experience: number;
  photo?: File | null;
};

export const teachersApi = {
  async list() {
    const { data } = await api.get('/teachers/all');
    return data;
  },
  async create(payload: TeacherPayload) {
    const formData = new FormData();
    formData.append('fullName', payload.fullName);
    formData.append('email', payload.email);
    formData.append('password', payload.password);
    formData.append('position', payload.position);
    formData.append('experience', String(payload.experience));
    if (payload.photo) formData.append('photo', payload.photo);
    const { data } = await api.post('/teachers', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  async update(id: string, payload: Partial<TeacherPayload>) {
    const formData = new FormData();
    Object.entries(payload).forEach(([key, value]) => {
      if (value === undefined || value === null) return;
      if (key === 'photo' && value instanceof File) formData.append('photo', value);
      else formData.append(key, String(value));
    });
    const { data } = await api.put(`/teachers/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  async remove(id: string) {
    const { data } = await api.delete(`/teachers/${id}`);
    return data;
  },
};