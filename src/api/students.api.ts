import { api } from './axios';

export type StudentPayload = {
  fullName: string;
  email: string;
  password: string;
  birthDate: string;
  photo?: File | null;
};

export const studentsApi = {
  async list(status?: string) {
    const query = status ? `?status=${encodeURIComponent(status)}` : '';
    const { data } = await api.get(`/students/all${query}`);
    return data;
  },

  async create(payload: StudentPayload) {
    const formData = new FormData();
    formData.append('fullName', payload.fullName);
    formData.append('email', payload.email);
    formData.append('password', payload.password);
    formData.append('birth_date', payload.birthDate); // ✅ to'g'irlandi
    if (payload.photo) formData.append('photo', payload.photo);

    const { data } = await api.post('/students', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async update(id: string, payload: Partial<StudentPayload>) {
    const formData = new FormData();

    if (payload.fullName) formData.append('fullName', payload.fullName);
    if (payload.email) formData.append('email', payload.email);
    if (payload.password) formData.append('password', payload.password);
    if (payload.birthDate) formData.append('birth_date', payload.birthDate); // ✅ to'g'irlandi
    if (payload.photo instanceof File) formData.append('photo', payload.photo);

    const { data } = await api.put(`/students/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },

  async remove(id: string) {
    const { data } = await api.delete(`/students/${id}`);
    return data;
  },

  async resetPassword(id: string) {
    const { data } = await api.post(`/students/${id}/reset-password`);
    return data;
  },

  async myGroups() {
    const { data } = await api.get('/students/my/groups');
    return data;
  },

  async myDashboard() {
    const { data } = await api.get('/students/my/dashboard');
    return data;
  },

  async myLessons(groupId: number) {
    const { data } = await api.get(`/students/my/lessons/${groupId}`);
    return data;
  },

  async myGroupHomework(groupId: number, lessonId: number) {
    const { data } = await api.get(`/students/my/group/homework/${groupId}`, {
      params: { lessonId },
    });
    return data;
  },

  async myGroupVideos(groupId: number) {
    const { data } = await api.get(`/students/my/group/lessonVideo/${groupId}`);
    return data;
  },
};