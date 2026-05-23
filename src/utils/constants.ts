export const APP_NAME = 'SignEase'
export const APP_TAGLINE = 'Turning Sign Language into Voice, Instantly'
export const APP_VERSION = '0.1.0'

export const ROUTES = {
  home: '/',
  onboarding: '/onboarding',
  login: '/login',
  signup: '/signup',
  resetPassword: '/reset-password',
  profileSetup: '/profile-setup',
  dashboard: '/dashboard',
  translate: '/translate',
  result: '/result',
  history: '/history',
  chat: '/chat',
  profile: '/profile',
  settings: '/settings',
  train: '/train',
  help: '/help',
  offline: '/offline',
  notFound: '/404',
} as const

export const DESIGN_TOKENS = {
  primary: '#2563EB',
  secondary: '#10B981',
  accent: '#F59E0B',
  muted: '#6B7280',
  background: '#FFFFFF',
  foreground: '#1F2937',
} as const
