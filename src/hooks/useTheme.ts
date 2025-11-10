import {themeContextType} from "../types/themeContext.ts";
import {useContext} from "react";
import {ThemeContext} from "../ThemeProvider.tsx";


export const useTheme = () :themeContextType => {
    const context = useContext(ThemeContext);
    if(!context){
        throw new Error("Use theme must be used within a ThemeProvider")
    }
    return context;
};
