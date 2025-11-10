import {useTheme} from "../hooks/useTheme.ts";

const ThemeSwitcher = () => {
    const {theme, toggleTheme} = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className="p-2 rounded-md bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-100"
        >
            Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
        </button>
    )
}

export default ThemeSwitcher;