import { useEffect } from 'react';
import { useTranslation } from "react-i18next";
import { Globe } from 'lucide-react';

export const LanguageSwitcher = () => {
    const { i18n } = useTranslation();

    // Load saved language preference on mount
    useEffect(() => {
        const savedLanguage = localStorage.getItem('preferredLanguage');
        if (savedLanguage && (savedLanguage === 'en' || savedLanguage === 'es')) {
            i18n.changeLanguage(savedLanguage);
        }
    }, [i18n]);

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
        // Save preference to localStorage
        localStorage.setItem('preferredLanguage', lng);
    };

    const currentLang = i18n.language || 'en';

    return (
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <Globe className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            <button
                onClick={() => changeLanguage("en")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                    currentLang === "en" 
                        ? "bg-blue-600 text-white shadow-sm" 
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
                title="English"
            >
                EN
            </button>
            <button
                onClick={() => changeLanguage("es")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                    currentLang === "es" 
                        ? "bg-blue-600 text-white shadow-sm" 
                        : "text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                }`}
                title="Español"
            >
                ES
            </button>
        </div>
    );
}