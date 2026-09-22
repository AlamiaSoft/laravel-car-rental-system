import { useState, useRef } from 'react';
import { Head, useForm } from '@inertiajs/react';
import GuestLayout from '@/Layouts/GuestLayout';
import InputLabel from '@/Components/InputLabel';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';
import PrimaryButton from '@/Components/PrimaryButton';
import SecondaryButton from '@/Components/SecondaryButton';

export default function TwoFactorChallenge() {
    const [recoveryMode, setRecoveryMode] = useState(false);
    const codeInput = useRef(null);
    const recoveryCodeInput = useRef(null);

    const { data, setData, post, processing, errors, reset, clearErrors } = useForm({
        code: '',
        recovery_code: '',
    });

    const toggleRecoveryMode = () => {
        clearErrors();
        reset();
        setRecoveryMode((prev) => !prev);
    };

    const submit = (e) => {
        e.preventDefault();

        post('/two-factor-challenge', {
            onError: () => {
                reset();
                if (recoveryMode) {
                    recoveryCodeInput.current?.focus();
                } else {
                    codeInput.current?.focus();
                }
            },
        });
    };

    return (
        <GuestLayout>
            <Head title="Two-Factor Authentication" />

            <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
                {recoveryMode
                    ? 'Please confirm access to your account by entering one of your emergency recovery codes.'
                    : 'Please confirm access to your account by entering the authentication code provided by your authenticator application.'}
            </div>

            <form onSubmit={submit} className="space-y-4">
                {!recoveryMode ? (
                    <div>
                        <InputLabel htmlFor="code" value="Code" />
                        <TextInput
                            id="code"
                            type="text"
                            name="code"
                            ref={codeInput}
                            value={data.code}
                            className="mt-1 block w-full text-center tracking-widest text-lg"
                            autoComplete="one-time-code"
                            isFocused={true}
                            placeholder="000000"
                            onChange={(e) => setData('code', e.target.value)}
                        />
                        <InputError message={errors.code} className="mt-2" />
                    </div>
                ) : (
                    <div>
                        <InputLabel htmlFor="recovery_code" value="Recovery Code" />
                        <TextInput
                            id="recovery_code"
                            type="text"
                            name="recovery_code"
                            ref={recoveryCodeInput}
                            value={data.recovery_code}
                            className="mt-1 block w-full text-center font-mono"
                            placeholder="abcdef-123456"
                            isFocused={true}
                            onChange={(e) => setData('recovery_code', e.target.value)}
                        />
                        <InputError message={errors.recovery_code} className="mt-2" />
                    </div>
                )}

                <div className="flex items-center justify-between mt-4">
                    <button
                        type="button"
                        onClick={toggleRecoveryMode}
                        className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 underline cursor-pointer"
                    >
                        {recoveryMode ? 'Use an authenticator code' : 'Use a recovery code'}
                    </button>

                    <PrimaryButton disabled={processing}>
                        Confirm
                    </PrimaryButton>
                </div>
            </form>
        </GuestLayout>
    );
}
