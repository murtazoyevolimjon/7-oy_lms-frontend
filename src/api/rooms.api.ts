import { api } from './axios';

export type RoomPayload = {
  name: string;
  capacity: number;
};

export const roomsApi = {
  async list() {
    const { data } = await api.get('/rooms/all');
    return data;
  },
  async create(payload: RoomPayload) {
    const { data } = await api.post('/rooms', payload);
    return data;
  },
  async update(id: string, payload: Partial<RoomPayload>) {
    const { data } = await api.patch(`/rooms/${id}`, payload);
    return data;
  },
  async remove(id: string) {
    const { data } = await api.delete(`/rooms/${id}`);
    return data;
  },
};
