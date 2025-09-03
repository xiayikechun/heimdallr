// 应用配置常量
export const APP_CONFIG = {
  APP_NAME: 'Heimdallr',
  VERSION: '3.0.0',
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;

// 本地存储键名
export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  THEME: 'theme',
  LANGUAGE: 'language',
  USER_PREFERENCES: 'user_preferences',
} as const;

// API响应状态码
export const API_STATUS = {
  SUCCESS: 0,
  CHANNEL_ERROR: 1,
  AUTH_ERROR: -1,
  PARAM_ERROR: 3,
} as const;

// 主题
export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system',
} as const;

// 语言
export const LANGUAGES = {
  ZH: 'zh',
  EN: 'en',
} as const;

// 路由路径
export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/dashboard',
  CHANNELS: '/channels',
  CHANNEL_CREATE: '/channels/create',
  CHANNEL_EDIT: '/channels/:id/edit',
  GROUPS: '/groups',
  GROUP_CREATE: '/groups/create',
  GROUP_EDIT: '/groups/:id/edit',
  PROFILE: '/profile',
  SETTINGS: '/settings',
} as const;