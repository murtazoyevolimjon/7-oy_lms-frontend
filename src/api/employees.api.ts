import { api } from './axios';

export type EmployeePayload = {
  fullName: string;
  email: string;
  password: string;
  position: string;
  hire_date: string;
  role: string;
  photo?: File | null;
};

export const employeesApi = {
  async list(params?: Record<string, unknown>) {
    const { data } = await api.get('/users', { params });
    return data;
  },
  async create(payload: EmployeePayload) {
    const formData = new FormData();
    formData.append('fullName', payload.fullName);
    formData.append('email', payload.email);
    formData.append('password', payload.password);
    formData.append('position', payload.position);
    formData.append('hire_date', payload.hire_date);
    formData.append('role', payload.role);
    if (payload.photo) formData.append('photo', payload.photo);
    const { data } = await api.post('/users', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return data;
  },
  async update(id: string, payload: Partial<EmployeePayload>) {
    const { data } = await api.put(`/users/${id}`, {
      fullName: payload.fullName,
      email: payload.email,
      position: payload.position,
    }, {
      headers: { 'Content-Type': 'application/json' },
    });
    return data;
  },
  async remove(id: string) {
    const { data } = await api.delete(`/users/${id}`);
    return data;
  },
};