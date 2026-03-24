import { api } from './axios';

export type StudentPayload = {
  fullName: string;
  email: string;
  password: string;
  birthDate: string;
  photo?: File | null;
};

export const studentsApi = {
  async list() {
    const { data } = await api.get('/students/all');
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
};