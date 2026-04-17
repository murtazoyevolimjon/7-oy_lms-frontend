import { api } from './axios';

type HomeworkResponsePayload = {
    homeworkId: number;
    title: string;
    file?: File | null;
};

export const homeworkResponseApi = {
    async create(payload: HomeworkResponsePayload) {
        const formData = new FormData();
        formData.append('homeworkId', String(payload.homeworkId));
        formData.append('title', payload.title);
        if (payload.file) formData.append('file', payload.file);

        const { data } = await api.post('/homework-response', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return data;
    },
};
