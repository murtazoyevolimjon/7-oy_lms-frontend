import React, { useState } from 'react';
import { CreditCard, AlertCircle } from 'lucide-react';
import { PaymentModal } from '../components/payment-modal';
import { PaymentHistory } from '../components/payment-history';

interface StudentPaymentsPageProps {
    studentGroupId?: number;
    studentId?: number;
}

export function StudentPaymentsPage({
    studentGroupId = 1,
    studentId = 1,
}: StudentPaymentsPageProps) {
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [refreshKey, setRefreshKey] = useState(0);

    const handlePaymentCreated = () => {
        setRefreshKey((prev) => prev + 1);
    };

    return (
        <div className="space-y-6 animate-fade-up">
            {/* Hero Section */}
            <div className="glass-panel rounded-3xl border border-white/80 p-6">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                        <h1 className="text-3xl font-bold brand-gradient-text">To'lovlar</h1>
                        <p className="mt-2 text-slate-600">
                            Kurs to'lovlarini Kyn to'lov tiziimi orqali amalga oshiring
                        </p>
                    </div>
                    <button
                        onClick={() => setIsPaymentModalOpen(true)}
                        className="brand-gradient lift-on-hover flex items-center gap-2 rounded-2xl px-6 py-3 font-semibold text-white shadow-md shadow-sky-500/25"
                    >
                        <CreditCard size={20} />
                        To'lov qilish
                    </button>
                </div>
            </div>

            {/* Info Box */}
            <div className="flex gap-3 rounded-2xl border border-blue-200 bg-blue-50 p-4">
                <AlertCircle size={20} className="flex-shrink-0 text-blue-600" />
                <div>
                    <p className="text-sm font-semibold text-blue-900">Xavfsiz to'lovlar</p>
                    <p className="mt-1 text-sm text-blue-700">
                        Barcha to'lovlar Kyn to'lov tiziimi orqali xavfsiz amalga oshiriladi
                    </p>
                </div>
            </div>

            {/* Payment History */}
            <PaymentHistory key={refreshKey} />

            {/* Payment Modal */}
            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                studentGroupId={studentGroupId}
                studentId={studentId}
                onPaymentCreated={handlePaymentCreated}
            />
        </div>
    );
}
