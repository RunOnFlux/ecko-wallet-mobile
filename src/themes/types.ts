export enum AppThemeEnum {
  LIGHT = 'LIGHT',
  DARK = 'DARK',
  DARK_BLUE = 'DARK_BLUE',
}

export const THEME_OPTIONS = [
  {key: AppThemeEnum.LIGHT, label: 'Light'},
  {key: AppThemeEnum.DARK, label: 'Dark'},
  {key: AppThemeEnum.DARK_BLUE, label: 'Dark Blue'},
];

export interface IPrimarySecondary {
  primary: string;
  secondary: string;
  disabled?: string;
}

export interface IAppTheme {
  isDark: boolean;
  background: string;
  surface: string;
  border: string;
  text: IPrimarySecondary;
  button: IPrimarySecondary;
  input: {
    color: string;
    background: string;
    placeholder: string;
    border: string;
  };
  alert: {color: string; background: string};
  error: {color: string; background: string};
  success: {color: string; background: string};
  brand: string;
  shadow: {
    shadowColor: string;
    shadowOffset: {width: number; height: number};
    shadowOpacity: number;
    shadowRadius: number;
    elevation: number;
  };
}
