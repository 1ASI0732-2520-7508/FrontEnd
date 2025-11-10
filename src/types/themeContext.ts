export type theme = "light" | "dark";
export interface themeContextType {
    theme: theme;
    toggleTheme: () => void;
}