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
