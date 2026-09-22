import { useState, useEffect } from 'react';
import { useForm, usePage } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';
import TextInput from '@/Components/TextInput';
import InputLabel from '@/Components/InputLabel';
import InputError from '@/Components/InputError';
import axios from 'axios';

export default function TwoFactorSettings({ className = '' }) {
    const { auth } = usePage().props;
    const user = auth.user;

    const [qrCode, setQrCode] = useState(null);
    const [secret, setSecret] = useState(null);
    const [recoveryCodes, setRecoveryCodes] = useState([]);
    const [showRecovery, setShowRecovery] = useState(false);
    const [isLoadingQr, setIsLoadingQr] = useState(false);

    const {
        data,
        setData,
        post,
        delete: destroy,
        processing,
        errors,
        reset,
        clearErrors
    } = useForm({
        code: '',
    });

    // Fetch QR Code and Secret if 2FA is initiated but not confirmed
    const fetchQrCode = async () => {
        setIsLoadingQr(true);
        try {
            const response = await axios.get(route('two-factor.qr-code'));
            setQrCode(response.data.svg);
            setSecret(response.data.secret);
        } catch (err) {
            console.error('Error fetching 2FA details', err);
        } finally {
            setIsLoadingQr(false);
        }
    };

    // Fetch recovery codes if enabled
    const fetchRecoveryCodes = async () => {
        try {
            const response = await axios.get(route('two-factor.recovery-codes'));
            setRecoveryCodes(response.data);
        } catch (err) {
            console.error('Error fetching recovery codes', err);
        }
    };

    useEffect(() => {
        if (user.two_factor_pending) {
            fetchQrCode();
        }
        if (user.two_factor_enabled) {
            fetchRecoveryCodes();
        }
    }, [user.two_factor_pending, user.two_factor_enabled]);

    const enable2fa = (e) => {
        e.preventDefault();
        post(route('two-factor.enable'), {
            preserveScroll: true,
            onSuccess: () => {
                fetchQrCode();
            }
        });
    };

    const confirm2fa = (e) => {
        e.preventDefault();
        post(route('two-factor.confirm'), {
            preserveScroll: true,
            onSuccess: () => {
                reset();
                clearErrors();
                fetchRecoveryCodes();
            },
            onError: () => {
                reset('code');
            }
        });
    };

    const disable2fa = (e) => {
        e.preventDefault();
        destroy(route('two-factor.disable'), {
            preserveScroll: true,
            onSuccess: () => {
                setQrCode(null);
                setSecret(null);
                setRecoveryCodes([]);
                setShowRecovery(false);
            }
        });
    };

    const regenerateCodes = (e) => {
        e.preventDefault();
        post(route('two-factor.regenerate-recovery-codes'), {
            preserveScroll: true,
            onSuccess: () => {
                fetchRecoveryCodes();
                setShowRecovery(true);
            }
        });
    };

    return (
        <section className={`space-y-6 ${className}`}>
            <header>
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    Two-Factor Authentication (MFA)
                </h2>
                <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                    Add additional security to your account using two-factor authentication (Google Authenticator, Authy, etc.).
                </p>
            </header>

            <div className="space-y-4">
                {!user.two_factor_enabled && !user.two_factor_pending && (
                    <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                            Two-factor authentication is currently <span className="font-bold text-red-600 dark:text-red-400">disabled</span>.
                        </p>
                        <form onSubmit={enable2fa}>
                            <PrimaryButton disabled={processing}>
                                Enable Two-Factor Authentication
                            </PrimaryButton>
                        </form>
                    </div>
                )}

                {user.two_factor_pending && (
                    <div className="space-y-4">
                        <p className="text-sm font-semibold text-amber-600 dark:text-amber-400">
                            Finish enabling two-factor authentication.
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                            Scan the QR code below using your authenticator application (Google Authenticator, Authy, etc.) to set up MFA:
                        </p>

                        {isLoadingQr ? (
                            <div className="p-4 bg-gray-100 dark:bg-gray-700 rounded w-48 h-48 flex items-center justify-center text-sm text-gray-500">
                                Generating QR Code...
                            </div>
                        ) : qrCode ? (
                            <div className="space-y-4">
                                <div className="p-2 bg-white inline-block border rounded" dangerouslySetInnerHTML={{ __html: qrCode }} />
                                {secret && (
                                    <div className="text-sm text-gray-700 dark:text-gray-300">
                                        Setup Key: <code className="bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded font-mono break-all">{secret}</code>
                                    </div>
                                )}
                            </div>
                        ) : null}

                        <form onSubmit={confirm2fa} className="max-w-md space-y-4">
                            <div>
                                <InputLabel htmlFor="code" value="Authentication Code" />
                                <TextInput
                                    id="code"
                                    type="text"
                                    className="mt-1 block w-full"
                                    value={data.code}
                                    onChange={(e) => setData('code', e.target.value)}
                                    placeholder="Enter 6-digit code"
                                    required
                                    autoComplete="one-time-code"
                                />
                                <InputError message={errors.code} className="mt-2" />
                            </div>

                            <div className="flex gap-4">
                                <PrimaryButton disabled={processing}>
                                    Confirm Activation
                                </PrimaryButton>
                                <SecondaryButton onClick={disable2fa} disabled={processing}>
                                    Cancel
                                </SecondaryButton>
                            </div>
                        </form>
                    </div>
                )}

                {user.two_factor_enabled && (
                    <div className="space-y-6">
                        <div className="bg-green-50 border-l-4 border-green-400 p-4 dark:bg-green-950 dark:border-green-800">
                            <div className="flex">
                                <div className="flex-shrink-0">
                                    <svg className="h-5 w-5 text-green-400 dark:text-green-600" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                    </svg>
                                </div>
                                <div className="ml-3">
                                    <p className="text-sm font-medium text-green-800 dark:text-green-200">
                                        Two-factor authentication is active.
                                    </p>
                                </div>
                            </div>
                        </div>

                        {recoveryCodes.length > 0 && (
                            <div className="space-y-4 bg-gray-50 dark:bg-gray-900/50 p-4 rounded border dark:border-gray-800">
                                <p className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
                                    Emergency Recovery Codes
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                    Store these recovery codes in a secure password manager. They can be used to access your account if you lose your authenticator device.
                                </p>

                                {showRecovery ? (
                                    <div className="grid grid-cols-2 gap-2 max-w-sm">
                                        {recoveryCodes.map((code, idx) => (
                                            <code key={idx} className="bg-white dark:bg-gray-800 border p-2 rounded text-center text-sm font-mono dark:border-gray-700 dark:text-gray-300">
                                                {code}
                                            </code>
                                        ))}
                                    </div>
                                ) : (
                                    <SecondaryButton onClick={() => setShowRecovery(true)}>
                                        Show Recovery Codes
                                    </SecondaryButton>
                                )}

                                {showRecovery && (
                                    <div className="flex gap-4">
                                        <SecondaryButton onClick={() => setShowRecovery(false)}>
                                            Hide Codes
                                        </SecondaryButton>
                                        <form onSubmit={regenerateCodes}>
                                            <SecondaryButton type="submit" disabled={processing}>
                                                Regenerate Codes
                                            </SecondaryButton>
                                        </form>
                                    </div>
                                )}
                            </div>
                        )}

                        <form onSubmit={disable2fa}>
                            <PrimaryButton className="!bg-red-600 hover:!bg-red-700" disabled={processing}>
                                Disable Two-Factor Authentication
                            </PrimaryButton>
                        </form>
                    </div>
                )}
            </div>
        </section>
    );
}
