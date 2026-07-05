import { api } from './apiClient'


export interface LoginCredentials {
  identifier: string
  password: string
}


export interface LoginResponse {
  token: string
}

export function login(credentials: LoginCredentials): Promise<LoginResponse> {
  return api.post<LoginResponse>('/auth/login', credentials)
}
