import React, { useEffect, useState } from 'react';
import { paymentsApi } from '@/api/payments.api';
import {
    CheckCircle,
    Clock,
    XCircle,
    AlertCircle,
    Download,
    RefreshCw,
} from 'lucide-react';

interface Payment {
    id: number;
    amount: any;
    status: 'PENDING' | 'COMPLETED' | 'FAILED' | 'CANCELLED' | 'REFUNDED';
    invoiceNumber: string;
    description: string;
    createdAt?: string;
    created_at?: string;
    paidAt?: string;
    paid_at?: string;
    kynTransactionId?: string;
}

export function PaymentHistory() {
    const [payments, setPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadPayments();
    }, []);

    const loadPayments = async () => {
        try {
            setLoading(true);
            const data = await paymentsApi.getMyPayments();
            setPayments(Array.isArray(data) ? data : data.data || []);
        } catch (err: any) {
            setError(err.message || 'To\'lovlarni yuklashda xato');
        } finally {
            setLoading(false);
        }
    };

    const refreshPayments = async () => {
        setRefreshing(true);
        await loadPayments();
        setRefreshing(false);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'COMPLETED':
                return <CheckCircle size={20} className="text-green-500" />;
            case 'PENDING':
                return <Clock size={20} className="text-amber-500" />;
            case 'FAILED':
            case 'CANCELLED':
                return <XCircle size={20} className="text-red-500" />;
            case 'REFUNDED':
                return <AlertCircle size={20} className="text-blue-500" />;
            default:
                return null;
        }
    };

    const getStatusLabel = (status: string) => {
        const labels: { [key: string]: string } = {
            COMPLETED: 'To\'landi',
            PENDING: 'Kutilmoqda',
            FAILED: 'Xato',
            CANCELLED: 'Bekor qilindi',
            REFUNDED: 'Qaytarildi',
        };
        return labels[status] || status;
    };

    const formatDate = (dateString: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('uz-UZ', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="glass-panel rounded-3xl border border-white/80 p-8 text-center">
                <div className="inline-block animate-spin">
                    <RefreshCw size={24} className="text-slate-400" />
                </div>
                <p className="mt-3 text-sm text-slate-600">Yuklanmoqda...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="glass-panel rounded-3xl border border-red-200 bg-red-50 p-6">
                <div className="flex gap-3">
                    <AlertCircle size={20} className="flex-shrink-0 text-red-600" />
                    <div>
                        <h4 className="font-semibold text-red-900">Xato</h4>
                        <p className="mt-1 text-sm text-red-700">{error}</p>
                    </div>
                </div>
            </div>
        );
    }

    if (payments.length === 0) {
        return (
            <div className="glass-panel rounded-3xl border border-white/80 p-8 text-center">
                <p className="text-sm text-slate-600">Hozircha to'lovlaringiz yo\'q</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-slate-900">To'lovlar tarixchasi</h3>
                <button
                    onClick={refreshPayments}
                    disabled={refreshing}
                    className="flex items-center gap-2 rounded-xl border border-white/80 bg-white/80 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-white disabled:opacity-50"
                >
                    <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
                    Yangilash
                </button>
            </div>

            <div className="space-y-3">
                {payments.map((payment) => (
                    <div
                        key={payment.id}
                        className="glass-panel flex items-center justify-between rounded-2xl border border-white/80 p-4"
                    >
                        <div className="flex flex-1 items-center gap-4">
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                                {getStatusIcon(payment.status)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-slate-900">
                                    {payment.description || `To'lov #${payment.invoiceNumber}`}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {formatDate(payment.createdAt || payment.created_at || payment.paidAt || payment.paid_at || '')}
                                </p>
                            </div>
                        </div>

                        <div className="text-right">
                            <p className="text-sm font-bold text-slate-900">
                                {Number(payment.amount).toLocaleString()} so'm
                            </p>
                            <p className="text-xs text-slate-600">
                                {getStatusLabel(payment.status)}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
