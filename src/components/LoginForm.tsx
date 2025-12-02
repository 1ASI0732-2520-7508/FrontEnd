import React, { useState } from 'react';
import { Eye, EyeOff, Package, Mail, Lock, AlertCircle } from 'lucide-react';
import { LoginCredentials } from '../types/auth';
import {EmailOtpModal} from "./EmailOtpModal.tsx";
import { useTranslation } from 'react-i18next';

interface LoginFormProps {
  onLogin: (credentials: LoginCredentials) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
  onSwitchToSignup: () => void;
}


export const LoginForm: React.FC<LoginFormProps> = ({ onLogin, isLoading, onSwitchToSignup}) => {
  const { t } = useTranslation();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const [needsEmailOtp, setNeedsEmailOtp] = useState<null | string>(null);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!credentials.username || !credentials.password) {
      setError(t('login.fillFields'));
      return;
    }

    // Skip OTP if VITE_SKIP_OTP is enabled (development only)
    const skipOtp = import.meta.env.VITE_SKIP_OTP === 'true';
    if (skipOtp) {
     const result = await onLogin(credentials);
     if(!result.success && result.error) setError(result.error);
     return;
    }


    setNeedsEmailOtp(credentials.username);

  };

  const afterOtpVerified = async () => {
    const result = await onLogin(credentials);
    if(!result.success && result.error) setError(result.error);
  }



  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4 shadow-lg">
            <Package className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t('login.title')}</h1>
          <p className="text-gray-600">{t('login.subtitle')}</p>
        </div>

        {/* Login Form */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
                <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertCircle className="w-5 h-5 text-red-600"/>
                  <span className="text-sm text-red-700">{error}</span>
                </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('login.email')}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>
                <input
                    type="text"
                    required
                    value={credentials.username}
                    onChange={(e) => setCredentials({...credentials, username: e.target.value})}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder={t('login.emailPlaceholder')}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t('login.password')}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5"/>
                <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={credentials.password}
                    onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                    className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                    placeholder={t('login.passwordPlaceholder')}
                />
                <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                >
                  {showPassword ? <EyeOff className="w-5 h-5"/> : <Eye className="w-5 h-5"/>}
                </button>
              </div>
            </div>

            <p className="text-center text-sm text-gray-600">
              {t('login.noAccount')}{" "}
              <button
                  type="button"
                  onClick={onSwitchToSignup}
                  className="text-blue-600 hover:text-blue-800 font-medium"
              >
                {t('login.signUp')}
              </button>
            </p>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"/>
              ) : (
                  t('login.signIn')
              )}
            </button>
          </form>
        </div>
      </div>
      {needsEmailOtp && (
          <EmailOtpModal email={needsEmailOtp} onVerified={async () => {
            await afterOtpVerified();
            //hide model
            setNeedsEmailOtp(null);
          }} onCancel={()=> setNeedsEmailOtp(null)}
          />
      )}
    </div>
  );
};
