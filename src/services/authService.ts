import { api } from './apiClient'

/** Cuerpo de POST /auth/login. */
export interface LoginCredentials {
  email: string
  password: string
}

/** Respuesta de POST /auth/login: el access token (JWT) del cliente. */
export interface LoginResponse {
  token: string
}

/**
 * POST /auth/login — autentica al cliente y devuelve su access token.
 * El token se persiste vía `useAuth().setToken(...)` en la capa de UI, no aquí,
 * para mantener el servicio libre de estado.
 */
export function login(credentials: LoginCredentials): Promise<LoginResponse> {
  return api.post<LoginResponse>('/auth/login', credentials)
}
