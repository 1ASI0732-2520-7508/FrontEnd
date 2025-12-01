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
                className={`px-2 py-1 rounded transition-colors duration-200 ${
                    i18n.language === "en" 
                        ? "bg-blue-500 text-white dark:bg-blue-600" 
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
            >
                EN
            </button>
            <button
                onClick={() => changeLanguage("es")}
                className={`px-2 py-1 rounded transition-colors duration-200 ${
                    i18n.language === "es" 
                        ? "bg-blue-500 text-white dark:bg-blue-600" 
                        : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600"
                }`}
            >
                ES
            </button>
        </div>
    );
}