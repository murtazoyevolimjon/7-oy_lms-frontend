import React, { useState } from 'react';
import { CreditCard, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { paymentsApi } from '@/api/payments.api';

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    studentGroupId: number;
    studentId: number;
    onPaymentCreated?: (paymentData: any) => void;
}

export function PaymentModal({
    isOpen,
    onClose,
    studentGroupId,
    studentId,
    onPaymentCreated,
}: PaymentModalProps) {
    const [amount, setAmount] = useState<string>('500000');
    const [description, setDescription] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<'KYN' | 'CARD'>('CARD');
    const [cardNumber, setCardNumber] = useState('');
    const [cardExpiry, setCardExpiry] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [otpCode, setOtpCode] = useState('');
    const [otpSessionId, setOtpSessionId] = useState('');
    const [otpStep, setOtpStep] = useState(false);
    const [maskedPhone, setMaskedPhone] = useState('');
    const [devOtpCode, setDevOtpCode] = useState('');
    const [receiverInfo, setReceiverInfo] = useState<{ owner?: string; card?: string } | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string>('');
    const [success, setSuccess] = useState(false);
    const [paymentUrl, setPaymentUrl] = useState<string>('');

    const handleCreatePayment = async () => {
        try {
            setError('');
            setLoading(true);

            const numericAmount = Number(amount);

            if (!numericAmount || numericAmount < 1000) {
                setError('Miqdori kamida 1000 so\'m bo\'lishi kerak');
                return;
            }

            const normalizedCard = cardNumber.replace(/\D/g, '');
            if (paymentMethod === 'CARD' && normalizedCard.length < 16) {
                setError('Karta raqami kamida 16 ta raqam bo\'lishi kerak');
                return;
            }

            if (paymentMethod === 'CARD' && !/^(0[1-9]|1[0-2])\/(\d{2})$/.test(cardExpiry)) {
                setError('Karta muddati MM/YY formatida bo\'lishi kerak');
                return;
            }

            if (paymentMethod === 'CARD' && !/^\+?\d{9,15}$/.test(phoneNumber.replace(/\s/g, ''))) {
                setError('Telefon raqamini to\'g\'ri kiriting');
                return;
            }

            const response = await paymentsApi.createPayment({
                amount: numericAmount,
                studentGroupId,
                studentId,
                description: description || 'Kurs uchun to\'lov',
                paymentMethod,
                cardLast4: paymentMethod === 'CARD' ? normalizedCard.slice(-4) : undefined,
                cardExpiry: paymentMethod === 'CARD' ? cardExpiry : undefined,
                phoneNumber: paymentMethod === 'CARD' ? phoneNumber.replace(/\s/g, '') : undefined,
            });

            if (response?.receiver) {
                setReceiverInfo(response.receiver);
            }

            if (response?.requiresOtp) {
                setOtpSessionId(response.otpSessionId || '');
                setMaskedPhone(response.maskedPhone || '');
                setDevOtpCode(response.devOtpCode || '');
                setOtpStep(true);
                return;
            }

            if (response.success && response.paymentUrl) {
                setSuccess(true);
                setPaymentUrl(response.paymentUrl);
                onPaymentCreated?.(response);

                // 3 sekunddan so'ng Kyn-ga yo'naltirish
                setTimeout(() => {
                    window.open(response.paymentUrl, '_blank');
                    onClose();
                }, 2000);
                return;
            }

            if (response.success) {
                setSuccess(true);
                onPaymentCreated?.(response);
                setTimeout(() => {
                    onClose();
                }, 1500);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'To\'lov yaratishda xato');
        } finally {
            setLoading(false);
        }
    };

    const handleConfirmOtp = async () => {
        try {
            setError('');
            setLoading(true);

            if (!/^\d{6}$/.test(otpCode)) {
                setError('SMS kod 6 ta raqam bo\'lishi kerak');
                return;
            }

            const response = await paymentsApi.confirmCardOtp({
                otpSessionId,
                otpCode,
            });

            if (response?.receiver) {
                setReceiverInfo(response.receiver);
            }

            if (response?.success) {
                setSuccess(true);
                setOtpStep(false);
                onPaymentCreated?.(response);
                setTimeout(() => {
                    onClose();
                }, 1500);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'SMS kodni tekshirishda xato');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="glass-panel animate-fade-up w-full max-w-md rounded-3xl border border-white/80 p-6 shadow-xl">
                {/* Header */}
                <div className="mb-6 flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl brand-gradient">
                        <CreditCard size={24} className="text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900">To'lov qiling</h2>
                </div>

                {/* Success State */}
                {success ? (
                    <div className="space-y-4 text-center">
                        <div className="flex justify-center">
                            <CheckCircle size={64} className="text-green-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900">To'lov yaratildi!</h3>
                        <p className="text-sm text-slate-600">
                            Siz Kyn to'lov tizimine yo'naltirilyaptsiz...
                        </p>
                        <button
                            onClick={onClose}
                            className="brand-gradient w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white"
                        >
                            Yopish
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Amount Input */}
                        <div className="mb-6 space-y-3">
                            <label className="block text-sm font-semibold text-slate-900">To'lov usuli</label>
                            <div className="grid grid-cols-2 gap-2">
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('CARD')}
                                    className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${paymentMethod === 'CARD'
                                        ? 'border-sky-300 bg-sky-50 text-sky-700'
                                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    Plastik karta
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setPaymentMethod('KYN')}
                                    className={`rounded-xl border px-3 py-2 text-sm font-medium transition ${paymentMethod === 'KYN'
                                        ? 'border-sky-300 bg-sky-50 text-sky-700'
                                        : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                                        }`}
                                >
                                    Kyn checkout
                                </button>
                            </div>

                            {paymentMethod === 'CARD' && (
                                <div className="space-y-2">
                                    <label className="block text-sm font-semibold text-slate-900">Karta raqami</label>
                                    <input
                                        type="text"
                                        inputMode="numeric"
                                        value={cardNumber}
                                        onChange={(e) => {
                                            const value = e.target.value.replace(/[^\d\s]/g, '').slice(0, 19);
                                            setCardNumber(value);
                                        }}
                                        className="w-full rounded-2xl border border-white/80 bg-white/85 px-4 py-3 text-base font-semibold outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                                        placeholder="8600 1234 5678 9012"
                                    />
                                    <div className="grid grid-cols-2 gap-2">
                                        <input
                                            type="text"
                                            value={cardExpiry}
                                            onChange={(e) => {
                                                const rawValue = e.target.value.replace(/[^\d/]/g, '');
                                                // Allow clearing the field
                                                if (rawValue === '') {
                                                    setCardExpiry('');
                                                    return;
                                                }
                                                // Remove slashes and limit to 4 digits
                                                let digits = rawValue.replace(/\D/g, '').slice(0, 4);
                                                // Add slash only after 2 digits (i.e., when user types 3+ digits)
                                                // This allows user to delete the slash and go back to "MM" state
                                                if (digits.length > 2) {
                                                    digits = digits.slice(0, 2) + '/' + digits.slice(2, 4);
                                                }
                                                setCardExpiry(digits);
                                            }}
                                            className="rounded-2xl border border-white/80 bg-white/85 px-4 py-3 text-base font-semibold outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                                            placeholder="MM/YY"
                                        />
                                        <input
                                            type="text"
                                            value={phoneNumber}
                                            onChange={(e) => {
                                                let value = e.target.value.replace(/[^\d+]/g, '').slice(0, 15);
                                                // Allow clearing the field
                                                if (value === '' || value === '+') {
                                                    setPhoneNumber('');
                                                    return;
                                                }
                                                // Ensure it always starts with +998
                                                if (!value.startsWith('+998') && value.length > 0) {
                                                    if (value.startsWith('998')) {
                                                        value = '+' + value;
                                                    } else if (value.startsWith('+')) {
                                                        // User entered +, let them type the rest
                                                        value = value;
                                                    } else {
                                                        // User is typing digits, prefix with +998
                                                        value = '+998' + value;
                                                    }
                                                }
                                                setPhoneNumber(value);
                                            }}
                                            className="rounded-2xl border border-white/80 bg-white/85 px-4 py-3 text-base font-semibold outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                                            placeholder="+998901234567"
                                            onFocus={(e) => {
                                                if (!e.target.value) {
                                                    setPhoneNumber('+998');
                                                }
                                            }}
                                        />
                                    </div>
                                    <p className="text-xs text-slate-500">
                                        Karta raqami backendga to'liq yuborilmaydi. Faqat oxirgi 4 ta raqami saqlanadi.
                                    </p>
                                </div>
                            )}

                            <label className="block text-sm font-semibold text-slate-900">
                                To'lov miqdori (so'm)
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    min="1000"
                                    step="1000"
                                    className="w-full rounded-2xl border border-white/80 bg-white/85 px-4 py-3 text-lg font-semibold outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                                    placeholder="Miqdorni kiriting"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-slate-500">
                                    UZS
                                </span>
                            </div>
                            {amount && Number(amount) > 0 && (
                                <p className="text-xs text-slate-600">
                                    Taqriban: {(Number(amount) / 1000).toFixed(0)} ming so'm
                                </p>
                            )}
                        </div>

                        {/* Description Input */}
                        <div className="mb-6 space-y-3">
                            <label className="block text-sm font-semibold text-slate-900">
                                Tavsif (ixtiyoriy)
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                className="w-full rounded-2xl border border-white/80 bg-white/85 px-4 py-2 text-sm outline-none focus:border-sky-300 focus:ring-2 focus:ring-sky-100"
                                placeholder="To'lov haqida izoh..."
                                rows={2}
                            />
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="mb-4 flex gap-3 rounded-2xl border border-red-200 bg-red-50 p-3">
                                <AlertCircle size={20} className="flex-shrink-0 text-red-600" />
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        {/* Info Box */}
                        <div className="mb-6 flex gap-2 rounded-2xl bg-blue-50 p-3 text-xs text-blue-700">
                            <Clock size={16} className="flex-shrink-0" />
                            <p>
                                To'lov xavfsiz gateway orqali amalga oshiriladi.
                            </p>
                        </div>

                        {receiverInfo && (
                            <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-700">
                                Mablag' qabul qiluvchi: {receiverInfo.owner} ({receiverInfo.card})
                            </div>
                        )}

                        {otpStep && (
                            <div className="mb-6 space-y-2 rounded-2xl border border-amber-200 bg-amber-50 p-3">
                                <p className="text-sm font-semibold text-amber-800">
                                    SMS kod yuborildi: {maskedPhone || 'telefon raqamingiz'}
                                </p>
                                <input
                                    type="text"
                                    inputMode="numeric"
                                    value={otpCode}
                                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    className="w-full rounded-xl border border-amber-200 bg-white px-4 py-2 text-base font-semibold outline-none"
                                    placeholder="6 xonali kod"
                                />
                                {devOtpCode && (
                                    <p className="text-xs text-amber-700">Test kod: {devOtpCode}</p>
                                )}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex gap-3">
                            <button
                                onClick={onClose}
                                disabled={loading}
                                className="flex-1 rounded-2xl border border-white/80 px-4 py-3 text-sm font-semibold text-slate-900 transition hover:bg-white/80 disabled:opacity-50"
                            >
                                Bekor qilish
                            </button>
                            <button
                                onClick={otpStep ? handleConfirmOtp : handleCreatePayment}
                                disabled={loading || !Number(amount)}
                                className="brand-gradient flex-1 rounded-2xl px-4 py-3 text-sm font-semibold text-white shadow-md shadow-sky-500/25 disabled:opacity-50"
                            >
                                {loading ? 'Yuklanmoqda...' : otpStep ? 'SMS kodni tasdiqlash' : "To'lovni davom ettirish"}
                            </button>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
