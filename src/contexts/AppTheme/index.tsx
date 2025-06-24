import React, {createContext, useContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {AppThemeEnum, IAppTheme} from '../../themes/types';
import {appThemes} from '../../themes';

interface AppThemeContextValue {
  theme: IAppTheme;
  selectedTheme: AppThemeEnum;
  setTheme: (theme: AppThemeEnum) => Promise<void>;
  isLoading: boolean;
}

const defaultAppThemeValue: AppThemeContextValue = {
  theme: appThemes[AppThemeEnum.DARK_BLUE],
  selectedTheme: AppThemeEnum.DARK_BLUE,
  setTheme: async () => {},
  isLoading: true,
};

export const AppThemeContext =
  createContext<AppThemeContextValue>(defaultAppThemeValue);

const THEME_STORAGE_KEY = 'APP_THEME';

export const AppThemeProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [selectedTheme, setSelectedTheme] = useState<AppThemeEnum>(
    AppThemeEnum.DARK_BLUE,
  );
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSavedTheme();
  }, []);

  const loadSavedTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (
        savedTheme &&
        Object.values(AppThemeEnum).includes(savedTheme as AppThemeEnum)
      ) {
        setSelectedTheme(savedTheme as AppThemeEnum);
      }
    } catch (error) {
      console.warn('Error loading saved theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setTheme = async (theme: AppThemeEnum) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, theme);
      setSelectedTheme(theme);
    } catch (error) {
      console.warn('Error saving theme:', error);
    }
  };

  const theme = appThemes[selectedTheme];

  return (
    <AppThemeContext.Provider
      value={{
        selectedTheme,
        theme,
        setTheme,
        isLoading,
      }}>
      {children}
    </AppThemeContext.Provider>
  );
};
