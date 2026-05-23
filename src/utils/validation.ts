export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
}

export function isValidPhone(phone: string): boolean {
  const cleaned = phone.replace(/[\s()-]/g, '')
  return /^\+?[0-9]\d{6,14}$/.test(cleaned)
}

export function isValidEmailOrPhone(input: string): boolean {
  return isValidEmail(input) || isValidPhone(input)
}

export type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong'

export function getPasswordStrength(password: string): PasswordStrength {
  if (password.length < 8) return 'weak'

  let score = 0
  if (/[a-z]/.test(password)) score++
  if (/[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++

  if (score <= 1) return 'weak'
  if (score === 2) return 'fair'
  if (score === 3) return 'good'
  return 'strong'
}

export function passwordsMatch(password: string, confirm: string): boolean {
  return password.length > 0 && password === confirm
}
