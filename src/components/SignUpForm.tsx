import {SignupCredentials} from "../types/auth.ts";
import React, {useState} from "react";
import {AlertCircle, Eye, EyeOff, Lock, Mail, Package} from "lucide-react";
import {GROUP_MAP} from "../types/group.ts";
import {ConfirmationModal} from "./ConfirmationModal.tsx";
import { useTranslation } from 'react-i18next';

interface SignUpFormProps {
    onSignUp: (credentials: SignupCredentials) => Promise<{success: boolean; error?: string}>;
    isLoading: boolean;
    onSwitchToLogin: () => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({onSignUp, isLoading, onSwitchToLogin}) => {
    const { t } = useTranslation();
    const [credentials, setCredentials] = useState<SignupCredentials>({
        username: '',
        email: '',
        password: '',
        confirm_password: '',
        company: -1,
        group: -1
    })
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        credentials.company = 1;
        credentials.username = credentials.email;
        console.log('Credentials: ',credentials);

        if (!credentials.email.trim() || !credentials.password.trim() || credentials.group === -1) {
            setError(t('signup.fillFields'));
            return;
        }

        if(credentials.password !== credentials.confirm_password){
            setError(t('signup.passwordsDontMatch'));
            return;
        }

        const result = await onSignUp(credentials);
        if(result.success){
            setShowSuccessModal(true);
        }else if(!result.success && result.error) setError(result.error);

    }


    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
                        <Package className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('signup.title')}</h1>
                    <p className="text-gray-600">{t('signup.subtitle')}</p>
                </div>

                {/* Form */}
                <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <AlertCircle className="w-5 h-5 text-red-600"/>
                                <span className="text-sm text-red-700">{error}</span>
                            </div>
                        )}

                        {/* Username
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                            <div className="relative">
                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    required
                                    value={credentials.username}
                                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value, email: e.target.value})}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder="Choose a username"
                                />
                            </div>
                        </div>
                        */}

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('signup.email')}</label>
                            <div className="relative">
                                <Mail
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>
                                <input
                                    type="email"
                                    required
                                    value={credentials.email}
                                    onChange={(e) => setCredentials({
                                        ...credentials,
                                        email: e.target.value,
                                        username: e.target.value
                                    })}
                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder={t('signup.emailPlaceholder')}
                                />
                            </div>
                        </div>

                        {/* Role Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('signup.role')}</label>
                            <select
                                required
                                value={
                                    Object.keys(GROUP_MAP).find(
                                        (key) => GROUP_MAP[key] === credentials.group
                                    ) || ""
                                }
                                onChange={(e) =>
                                    setCredentials({
                                        ...credentials,
                                        group: GROUP_MAP[e.target.value],
                                    })
                                }
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                            >
                                <option value="">{t('signup.selectRole')}</option>
                                {Object.keys(GROUP_MAP).map((role) => (
                                    <option key={role} value={role}>
                                        {role}
                                    </option>
                                ))}
                            </select>
                        </div>



                        {/* Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('signup.password')}</label>
                            <div className="relative">
                                <Lock
                                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>
                                <input
                                    type={showPassword ? "text" : "password"}
                                    required
                                    value={credentials.password}
                                    onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    placeholder={t('signup.passwordPlaceholder')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">{t('signup.confirmPassword')}</label>
                            <input
                                type="password"
                                required
                                value={credentials.confirm_password}
                                onChange={(e) => setCredentials({...credentials, confirm_password: e.target.value})}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                placeholder={t('signup.confirmPasswordPlaceholder')}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all font-medium disabled:opacity-50"
                        >
                            {isLoading ? (
                                <div
                                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
                            ) : (
                                t('signup.signUp')
                            )}
                        </button>

                        <p className="text-center text-sm text-gray-600">
                            {t('signup.hasAccount')}{" "}
                            <button
                                type="button"
                                onClick={onSwitchToLogin}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                            >
                                {t('signup.signIn')}
                            </button>
                        </p>
                    </form>

                    <ConfirmationModal
                        isOpen = {showSuccessModal}
                        onClose={() => {
                            setShowSuccessModal(false);
                            onSwitchToLogin();
                        }}
                        message = {t('signup.successMessage')}
                    />

                </div>
            </div>
        </div>

    );


}