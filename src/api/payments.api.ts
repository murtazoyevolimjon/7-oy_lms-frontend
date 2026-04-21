import { api } from './axios';

export const paymentsApi = {
    /**
     * Yangi to'lov yaratish
     */
    createPayment: async (data: {
        amount: number;
        studentGroupId: number;
        studentId: number;
        description?: string;
        paymentMethod?: 'KYN' | 'CARD' | 'TRANSFER';
        cardLast4?: string;
        cardExpiry?: string;
        phoneNumber?: string;
    }) => {
        const response = await api.post('/payments/create', data);
        return response.data;
    },

    confirmCardOtp: async (data: { otpSessionId: string; otpCode: string }) => {
        const response = await api.post('/payments/confirm-card-otp', data);
        return response.data;
    },

    getAdminNotifications: async () => {
        const response = await api.get('/payments/admin-notifications');
        return response.data;
    },

    /**
     * Mening to'lovlarim
     */
    getMyPayments: async () => {
        const response = await api.get('/payments/my-payments');
        return response.data;
    },

    /**
     * To'lov statusini tekshirish
     */
    checkPaymentStatus: async (transactionId: string) => {
        const response = await api.get(`/payments/status/${transactionId}`);
        return response.data;
    },

    /**
     * Guruh to'lovlari statistikasi
     */
    getPaymentStats: async (studentGroupId: number) => {
        const response = await api.get(`/payments/stats/${studentGroupId}`);
        return response.data;
    },
};
