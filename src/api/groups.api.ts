import { api } from './axios';

export type GroupPayload = {
  name: string;
  courseId: string;
  roomId: string;
  teacherId: string;
  studentIds?: string[];
  startDate: string;
  endDate: string;
  weekDays: string[];
  startTime: string;
};

export const groupsApi = {
  async list(params?: Record<string, unknown>) {
    const { data } = await api.get('/groups/all', { params });
    return data;
  },
  async getById(id: string) {
    const { data } = await api.get(`/groups/${id}`);
    return data;
  },
  async create(payload: GroupPayload) {
    const { data } = await api.post('/groups', payload);
    return data;
  },
  async update(id: string, payload: Partial<GroupPayload>) {
    const { data } = await api.patch(`/groups/${id}`, payload); // ✅ PUT → PATCH
    return data;
  },
  async remove(id: string) {
    const { data } = await api.delete(`/groups/${id}`);
    return data;
  },
  async attendance(id: string, month: string) {
    const { data } = await api.get(`/groups/${id}/attendance`, { params: { month } });
    return data;
  },
  async updateAttendance(payload: {
    groupId?: string;
    studentId: string;
    date: string;
    status: 'present' | 'absent' | null;
  }) {
    const { data } = await api.patch('/attendance', payload);
    return data;
  },
};