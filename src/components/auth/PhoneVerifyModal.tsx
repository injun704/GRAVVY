import React, { useEffect, useRef, useState } from 'react';
import { X, Phone, ShieldCheck, Loader2, ArrowRight, AlertCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

interface PhoneVerifyModalProps {
    onClose: () => void;
    onVerified: () => void;
}

/**
 * Asks a signed-in customer (Google / email) to verify a mobile number with an SMS OTP
 * before placing an order. The number is linked to their existing account.
 */
export const PhoneVerifyModal: React.FC<PhoneVerifyModalProps> = ({ onClose, onVerified }) => {
    const { theme, categoryAccent, textColorPrimary, textColorMuted } = useTheme();
    const { sendPhoneLinkOtp, confirmPhoneLinkOtp } = useAuth();

    const recaptchaRef = useRef<HTMLDivElement>(null);
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [otpSent, setOtpSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [cooldown, setCooldown] = useState(0);

    useEffect(() => {
        if (cooldown <= 0) return;
        const t = setTimeout(() => setCooldown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [cooldown]);

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (loading || cooldown > 0 || !recaptchaRef.current) return;
        if (phone.replace(/\D/g, '').length < 10) {
            setError('Please enter a valid 10-digit mobile number.');
            return;
        }
        setLoading(true);
        setError(null);
        const res = await sendPhoneLinkOtp(phone.trim(), recaptchaRef.current);
        setLoading(false);
        setCooldown(30);
        if (res.success) {
            setOtpSent(true);
            setOtp('');
        } else {
            setError(res.message);
        }
    };

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;
        if (otp.trim().length < 6) {
            setError('Please enter the 6-digit code.');
            return;
        }
        setLoading(true);
        setError(null);
        const res = await confirmPhoneLinkOtp(otp.trim());
        setLoading(false);
        if (res.success) {
            onVerified();
        } else {
            setError(res.message);
        }
    };

    const inputClass = `w-full py-2.5 px-3 rounded-xl text-xs font-bold border outline-hidden transition-all ${theme === 'LIGHT'
            ? 'bg-stone-50 border-stone-300 text-stone-900 focus:border-amber-500'
            : 'bg-stone-800 border-stone-700 text-stone-100 focus:border-amber-400'
        }`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md">
            <div
                className={`w-full max-w-sm rounded-2xl border shadow-2xl ${theme === 'LIGHT'
                        ? 'bg-white border-stone-200 text-stone-900'
                        : 'bg-stone-900 border-white/10 text-stone-100'
                    }`}
            >
                <div className="p-4 border-b border-stone-500/10 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        <h2 className={`text-sm font-black tracking-tight ${textColorPrimary}`}>Verify your mobile number</h2>
                    </div>
                    <button type="button" onClick={onClose} aria-label="Close" className="p-1 rounded-lg cursor-pointer">
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="p-4 space-y-3">
                    <p className={`text-xs ${textColorMuted}`}>
                        We need a verified mobile number so the delivery partner can reach you. We&apos;ll send a
                        6-digit code by SMS.
                    </p>

                    {/* Invisible reCAPTCHA container */}
                    <div ref={recaptchaRef} className="w-0 h-0 overflow-hidden opacity-0 pointer-events-none" />

                    <form onSubmit={otpSent ? handleVerify : handleSend} className="space-y-3">
                        <div className="relative">
                            <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                            <input
                                type="tel"
                                inputMode="numeric"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                disabled={otpSent}
                                placeholder="9876543210"
                                className={`${inputClass} pl-9`}
                            />
                        </div>

                        {otpSent && (
                            <input
                                type="text"
                                inputMode="numeric"
                                autoComplete="one-time-code"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                placeholder="Enter 6-digit code"
                                className={`${inputClass} tracking-[0.3em] text-center`}
                            />
                        )}

                        {error && (
                            <div className="p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-400 text-xs font-bold flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 shrink-0" />
                                <span>{error}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || (!otpSent && cooldown > 0)}
                            className={`w-full py-3 px-4 rounded-xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer active:scale-95 ${loading ? 'bg-stone-700 text-stone-300' : `${categoryAccent.bgClass} text-stone-950`
                                }`}
                        >
                            {loading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <>
                                    <span>{otpSent ? 'Verify & continue' : 'Send code'}</span>
                                    <ArrowRight className="w-4 h-4" />
                                </>
                            )}
                        </button>

                        {otpSent && (
                            <div className="flex items-center justify-between text-[11px]">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setOtpSent(false);
                                        setOtp('');
                                        setError(null);
                                    }}
                                    className={`${textColorMuted} underline cursor-pointer`}
                                >
                                    Change number
                                </button>
                                <button
                                    type="button"
                                    disabled={cooldown > 0 || loading}
                                    onClick={() => handleSend()}
                                    className={`font-bold cursor-pointer ${cooldown > 0 ? 'text-stone-500' : 'text-amber-400'}`}
                                >
                                    {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
                                </button>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};