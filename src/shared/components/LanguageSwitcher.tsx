import {useTranslation} from "react-i18next";

export const LanguageSwitcher = () => {
    const {i18n} = useTranslation();

    const changeLanguage = (lng: string | undefined) => {
        i18n.changeLanguage(lng);
    };

    return (
        <div className="flex gap-2 items-center">
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

    )
}