import {createContext, ReactNode, useEffect, useState} from "react";
import {theme, themeContextType} from "./types/themeContext.ts";

export const ThemeContext = createContext<themeContextType | undefined>(undefined);

export const ThemeProvider = ({ children} : {children: ReactNode}) => {
    const [theme, setTheme] = useState<theme>(() => {
        const storedTheme = localStorage.getItem("theme") as theme | null;
        if (storedTheme) return storedTheme;

        // Fix: properly detect system dark mode
        return window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";
    });

    useEffect(() => {
        if (theme === "dark") {
            document.documentElement.classList.add("dark");
        } else {
            document.documentElement.classList.remove("dark");
        }

        localStorage.setItem("theme", theme);
    }, [theme]);

    const toggleTheme = () => {
        // Fix: must return a value inside setTheme callback
        setTheme((prevTheme) => (prevTheme === "light" ? "dark" : "light"));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

