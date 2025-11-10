import { ThemeContext } from "../../ThemeProvider";
import {useContext} from "react";


export default function ThemeSwitcher() {
    const { theme, toggleTheme } = useContext(ThemeContext);
    const isDark = theme === "dark";

    return (
        <button
            type="button"
            role="switch"
            aria-checked={isDark}
            onClick={toggleTheme}
            className={[
                "group inline-flex items-center gap-2 select-none",
                "rounded-2xl p-1",
                "bg-gray-100 dark:bg-gray-800",
                "shadow-sm ring-1 ring-inset ring-gray-300/60 dark:ring-gray-700/60",
                "transition-colors duration-300",
                "hover:bg-gray-200/80 dark:hover:bg-gray-700/80",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500/70"
            ].join(" ")}
            title={`Switch to ${isDark ? "Light" : "Dark"} mode`}
        >
            {/* Sun / Moon icons */}
            <span className="relative flex h-6 w-6 items-center justify-center">
        {/* Sun */}
                <svg
                    aria-hidden
                    viewBox="0 0 24 24"
                    className="absolute h-5 w-5 opacity-100 transition-opacity duration-300 group-[aria-checked=true]:opacity-0"
                >
          <path
              fill="currentColor"
              d="M12 4a1 1 0 0 1 1-1h0a1 1 0 0 1 1 1v1a1 1 0 1 1-2 0V4Zm7 8a1 1 0 0 1 1-1h1a1 1 0 1 1 0 2h-1a1 1 0 0 1-1-1ZM4 11a1 1 0 0 1 1-1H4a1 1 0 1 1 0 2h1a1 1 0 0 1-1-1Zm7 9a1 1 0 1 1 2 0v1a1 1 0 1 1-2 0v-1Zm8.657-12.243a1 1 0 0 1 1.414 1.414l-.707.707a1 1 0 0 1-1.414-1.414l.707-.707ZM5.636 17.657a1 1 0 1 1 1.414 1.414l-.707.707A1 1 0 1 1 4.93 18.364l.707-.707Zm12.021 6e-3a1 1 0 0 1 1.414-1.414l.707.707a1 1 0 1 1-1.414 1.414l-.707-.707ZM6.343 6.343A1 1 0 1 1 7.757 4.93l.707.707A1 1 0 0 1 7.05 7.05l-.707-.707Z"
          />
          <circle cx="12" cy="12" r="3.25" fill="currentColor" />
        </svg>
                {/* Moon */}
                <svg
                    aria-hidden
                    viewBox="0 0 24 24"
                    className="absolute h-5 w-5 opacity-0 transition-opacity duration-300 group-[aria-checked=true]:opacity-100"
                >
          <path
              fill="currentColor"
              d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z"
          />
        </svg>
      </span>

            {/* Track with animated thumb */}
            <span
                className={[
                    "relative h-7 w-14",
                    "rounded-full",
                    "bg-white/70 dark:bg-black/20",
                    "ring-1 ring-inset ring-gray-300/70 dark:ring-gray-700/70",
                    "transition-colors duration-300"
                ].join(" ")}
                aria-hidden
            >
        <span
            className={[
                "absolute top-1/2 -translate-y-1/2",
                "h-5 w-5 rounded-full",
                "bg-gray-900 dark:bg-white",
                "shadow-sm",
                "transition-transform duration-300",
                isDark ? "translate-x-[2.25rem]" : "translate-x-1"
            ].join(" ")}
        />
      </span>

            {/* Label */}
            <span className="min-w-[5.5rem] text-sm font-medium text-gray-800 dark:text-gray-100">
        {isDark ? "Dark" : "Light"} mode
      </span>
        </button>
    );
}
