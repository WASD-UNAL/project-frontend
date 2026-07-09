import { api } from './apiClient'

export interface LoginCredentials {
  identifier: string
  password: string
}

export interface RegisterCredentials {
  name: string
  lastname: string
  email: string
  document: string
  password: string
}

export interface AuthResult {
  token: string
}

export function login(credentials: LoginCredentials): Promise<AuthResult> {
  return api.post<AuthResult>('/auth/login', credentials)
}

export function register(credentials: RegisterCredentials): Promise<AuthResult> {
  return api.post<AuthResult>('/auth/register', credentials)
}

export function roleFromToken(token: string): string | null {
  try {
    const payload = token.split('.')[1]
    const json = atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
    const data = JSON.parse(json) as { role?: unknown }
    return typeof data.role === 'string' ? data.role : null
  } catch {
    return null
  }
}
