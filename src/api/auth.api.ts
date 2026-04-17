import { api } from './axios';

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: string;
    fullName: string; role: string;
    avatar?: string | null;
  };
};

export type RegisterAdminPayload = {
  email: string;
  fullName: string;
  code: string;
  password: string;
};

export const authApi = {
  async loginAdmin(payload: LoginPayload) {
    const { data } = await api.post<LoginResponse>('/auth/login/admin', payload);
    return data;
  },
  async loginTeacher(payload: LoginPayload) {
    const { data } = await api.post<LoginResponse>('/auth/login/teacher', payload);
    return data;
  },
  async loginStudent(payload: LoginPayload) {
    const { data } = await api.post<LoginResponse>('/auth/login/student', payload);
    return data;
  },
  async login(payload: LoginPayload) {
    return this.loginAdmin(payload);
  },
  async me() {
    const { data } = await api.get('/auth/me');
    return data;
  },
  async logout() {
    const { data } = await api.post('/auth/logout');
    return data;
  },
  async sendOtp(email: string) {
    const { data } = await api.post('/auth/send-otp', { email });
    return data;
  },
  async registerAdmin(payload: RegisterAdminPayload) {
    const { data } = await api.post('/auth/register/admin', payload);
    return data;
  },
};