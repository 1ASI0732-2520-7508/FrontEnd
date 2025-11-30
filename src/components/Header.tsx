import React from 'react';
import { Search, Plus, LogOut, User } from 'lucide-react';
import { User as UserType } from '../types/auth';
import {LanguageSwitcher} from "../shared/components/LanguageSwitcher.tsx";
import ThemeSwitcher from "../shared/components/ThemeSwitcher.tsx";
import { useTranslation } from 'react-i18next';

interface HeaderProps {
  onAddItem: () => void;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  user: UserType;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onAddItem, searchTerm, onSearchChange, user, onLogout }) => {
  const { t } = useTranslation();

  return (
    <header className="dark:bg-white border-b dark:border-gray-200 px-8 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-6">
          <h2 className="text-2xl font-bold text-gray-900">{t('header.title')}</h2>
          <div className="relative">
            {searchTerm !== undefined && onSearchChange && (
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />) &&
                (<input
              type="text"
              placeholder={t('header.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10 pr-4 py-2 w-80 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
            />)}
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <ThemeSwitcher></ThemeSwitcher>
          <LanguageSwitcher/>
          {/*<button className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors duration-200">
            <Bell className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
          </button>*/}
          
          <div className="flex items-center space-x-3 px-3 py-2 bg-gray-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-white" />
            </div>
            <div className="text-sm">
              <p className="font-medium text-gray-900">{user.username}</p>
              <p className="text-gray-500 capitalize">{user.group}</p>
            </div>
          </div>
          
          <button
            onClick={onLogout}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
            title={t('header.logout')}
          >
            <LogOut className="w-5 h-5" />
          </button>
          
          <button
            onClick={onAddItem}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
          >
            <Plus className="w-5 h-5" />
            <span>{t('header.addItem')}</span>
          </button>
        </div>
      </div>
    </header>
  );
};