import { useContext } from "react";
import { ThemeContext } from "../../ThemeProvider.tsx";

function ThemeSwitcher() {
    const context = useContext(ThemeContext);

    if(!context) {
        throw new Error("ThemeSwitcher must be used within ThemeProvider");
    }
    const { theme, toggleTheme } = context;
    const isDark = theme === "dark";

    return (
        <button
            type="button"
            role="switch"
            aria-checked={isDark}
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? "Light" : "Dark"} mode`}
            className={[
                "group relative inline-flex h-10 w-20 items-center",
                "rounded-full border shadow-inner transition-all duration-300 ease-out",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
                "focus-visible:ring-indigo-500 ring-offset-slate-100 dark:ring-offset-slate-900",
                "border-slate-300 bg-gradient-to-br from-slate-50 to-slate-200",
                "dark:border-slate-700 dark:from-slate-800 dark:to-slate-900",
                "hover:shadow-lg"
            ].join(" ")}
        >
            {/* Sun icon (left) */}
            <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className={[
                    "absolute left-2 h-5 w-5 transition-opacity duration-300",
                    isDark ? "opacity-0" : "opacity-100",
                    "text-amber-500"
                ].join(" ")}
            >
                <path
                    fill="currentColor"
                    d="M6.76 4.84l-1.8-1.79L3.17 4.84l1.79 1.8 1.8-1.8zm10.48 0l1.8-1.79 1.79 1.79-1.79 1.8-1.8-1.8zM12 2h0a1 1 0 011 1v2a1 1 0 11-2 0V3a1 1 0 011-1zm0 17a5 5 0 100-10 5 5 0 000 10zm9-6a1 1 0 110 2h-2a1 1 0 110-2h2zM5 13a1 1 0 110 2H3a1 1 0 110-2h2zm1.76 6.16l-1.8 1.8-1.79-1.8 1.79-1.8 1.8 1.8zm10.48 0l1.8 1.8 1.79-1.8-1.79-1.8-1.8 1.8zM12 19a1 1 0 011 1v2a1 1 0 11-2 0v-2a1 1 0 011-1z"
                />
            </svg>

            {/* Moon icon (right) */}
            <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className={[
                    "absolute right-2 h-5 w-5 transition-opacity duration-300",
                    isDark ? "opacity-100" : "opacity-0",
                    "text-sky-400"
                ].join(" ")}
            >
                <path
                    fill="currentColor"
                    d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"
                />
            </svg>

            {/* Knob */}
            <span
                className={[
                    "absolute left-1 top-1 h-8 w-8 rounded-full shadow-md",
                    "bg-white dark:bg-slate-700",
                    "transform transition-transform duration-300 ease-out",
                    isDark ? "translate-x-10" : "translate-x-0"
                ].join(" ")}
            />

            {/* Visible label (optional). Remove if you want icon-only */}
            <span
                className={[
                    "pointer-events-none absolute -bottom-6 w-full text-center text-xs",
                    "text-slate-700 dark:text-slate-300 select-none"
                ].join(" ")}
            >
        {isDark ? "Dark" : "Light"}
      </span>
        </button>
    );
}

export default ThemeSwitcher;
