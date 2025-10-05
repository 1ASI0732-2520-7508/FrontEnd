
export const EXP_MINUTES = 5;

export const makeCode = () =>
    Math.floor(100000 + Math.random() * 900000).toString();

export const storeChallenge = (email: string, code: string) => {
    const exp = Date.now() + EXP_MINUTES * 60 * 1000;
    localStorage.setItem('otp_challenge', JSON.stringify({ email, code, exp }));
};

export const verifyChallenge = (email: string, input: string) => {
    const raw = localStorage.getItem('otp_challenge');
    if (!raw) return { ok: false, reason: 'no-challenge' as const };
    try {
        const { email: e, code, exp } = JSON.parse(raw);
        if (Date.now() > exp) return { ok: false, reason: 'expired' as const };
        if (email !== e) return { ok: false, reason: 'email-mismatch' as const };
        return { ok: input === code };
    } catch {
        return { ok: false, reason: 'parse-error' as const };
    }
};

export const clearChallenge = () => localStorage.removeItem('otp_challenge');
