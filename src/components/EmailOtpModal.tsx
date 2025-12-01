// components/EmailOtpModal.tsx
import { useEffect, useMemo, useRef, useState } from 'react';
import emailjs from '@emailjs/browser';
import { makeCode, storeChallenge, verifyChallenge, clearChallenge, EXP_MINUTES } from '../utils/opt.ts';
import { useTranslation } from 'react-i18next';

interface Props {
    email: string;
    onVerified: () => void;
    onCancel: () => void;
}

const RESEND_COOLDOWN_SEC = 30;

export function EmailOtpModal({ email, onVerified, onCancel }: Props) {
    const { t } = useTranslation();
    const [sent, setSent] = useState(false);
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [sending, setSending] = useState(false);
    const [verifying, setVerifying] = useState(false);
    const [cooldown, setCooldown] = useState(0);
    const timerRef = useRef<number | null>(null);

    // Init EmailJS once
    useEffect(() => {
        const pk = import.meta.env.VITE_EMAILJS_PUBLIC_KEY as string | undefined;
        console.log(pk);
        if (pk) {
            // safe to call multiple times; sdk internal guard prevents reinit collisions
            emailjs.init({ publicKey: pk });
        } else {
            // surface a clear error if missing
            console.warn('VITE_EMAILJS_PUBLIC_KEY missing');
        }
        return () => {
            if (timerRef.current) window.clearInterval(timerRef.current);
        };
    }, []);

    // Derived params for the template
    const templateParams = useMemo(
        () => ({
            to_email: email,
            code: '', // we’ll set real code at send time
            exp_minutes: EXP_MINUTES,
            app_name: import.meta.env.VITE_APP_NAME || 'InventoryPro',
        }),
        [email]
    );

    const startCooldown = () => {
        setCooldown(RESEND_COOLDOWN_SEC);
        if (timerRef.current) window.clearInterval(timerRef.current);
        timerRef.current = window.setInterval(() => {
            setCooldown((s) => {
                if (s <= 1) {
                    if (timerRef.current) window.clearInterval(timerRef.current);
                    timerRef.current = null;
                    return 0;
                }
                return s - 1;
            });
        }, 1000);
    };

    const sendCode = async () => {
        setError('');
        setSending(true);

        const otp = makeCode();
        storeChallenge(email, otp);

        try {
            const serviceId = import.meta.env.VITE_EMAILJS_SERVICE_ID as string;
            const templateId = import.meta.env.VITE_EMAILJS_TEMPLATE_ID as string;
            if (!serviceId || !templateId) {
                throw new Error('EmailJS service/template env vars are missing');
            }

            // send with the live OTP
            await emailjs.send(serviceId, templateId, { ...templateParams, code: otp });

            setSent(true);
            startCooldown();
        } catch (e: any) {
            console.error(e?.status, e?.text || e);
            setError(t('otp.error'));
        } finally {
            setSending(false);
        }
    };

    const handleVerify = async () => {
        setError('');
        setVerifying(true);
        try {
            const res = verifyChallenge(email, code.trim());
            if (!res.ok) {
                // Provide targeted feedback
                const reason = (res as any).reason;
                if (reason === 'expired') setError(t('otp.expired'));
                else if (reason === 'email-mismatch') setError(t('otp.mismatch'));
                else if (reason === 'no-challenge') setError(t('otp.noChallenge'));
                else setError(t('otp.invalid'));
                return;
            }
            clearChallenge();
            onVerified();
        } finally {
            setVerifying(false);
        }
    };

    // Auto-send on first open for convenience (optional)
    useEffect(() => {
        if (!sent && !sending) {
            void sendCode();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm grid place-items-center p-4">
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl border border-gray-100 p-6 space-y-4">
                <h3 className="text-lg font-semibold">{t('otp.title')}</h3>

                {!sent ? (
                    <>
                        <p className="text-sm text-gray-600">
                            {t('otp.description', { email })}
                        </p>
                        <button
                            onClick={sendCode}
                            disabled={sending}
                            className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                            {sending ? t('otp.sending') : t('otp.sendCode')}
                        </button>
                    </>
                ) : (
                    <>
                        <label className="block text-sm font-medium text-gray-700">{t('otp.verificationCode')}</label>
                        <input
                            inputMode="numeric"
                            maxLength={6}
                            value={code}
                            onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder={t('otp.codePlaceholder')}
                            autoFocus
                        />

                        <div className="flex items-center gap-2">
                            <button
                                onClick={handleVerify}
                                disabled={verifying || code.length !== 6}
                                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                {verifying ? t('otp.verifying') : t('otp.verify')}
                            </button>

                            <button
                                onClick={sendCode}
                                disabled={sending || cooldown > 0}
                                className="px-3 py-2 border rounded-lg hover:bg-gray-50 disabled:opacity-50"
                                title={cooldown > 0 ? t('otp.wait', { seconds: cooldown }) : t('otp.resend')}
                            >
                                {cooldown > 0 ? t('otp.resendWait', { seconds: cooldown }) : t('otp.resend')}
                            </button>
                        </div>

                        <p className="text-xs text-gray-500">
                            {t('otp.expires', { minutes: EXP_MINUTES })}
                        </p>
                    </>
                )}

                {error && <p className="text-sm text-red-600">{error}</p>}

                <button onClick={onCancel} className="text-sm text-gray-500 underline">
                    {t('otp.cancel')}
                </button>
            </div>
        </div>
    );
}
