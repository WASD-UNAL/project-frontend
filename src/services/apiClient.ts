// Cliente HTTP tipado para el backend de Gymly. Centraliza la base URL, el
// header Authorization (JWT desde localStorage) y el manejo de errores, para no
// repetir `fetch(...).then(r => { if (!r.ok) throw... })` en cada servicio.

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8080/api'

/** Clave de localStorage donde vive el access token. */
export const TOKEN_KEY = 'gymly_token'

/** Error con el código/estado que devuelve el backend (`{ error, message }`). */
export class ApiError extends Error {
  readonly status: number
  readonly code: string

  constructor(status: number, code: string, message: string) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = code
  }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY)
  const headers = new Headers(options.headers)
  headers.set('Content-Type', 'application/json')
  if (token) headers.set('Authorization', `Bearer ${token}`)

  const res = await fetch(`${API_BASE}${path}`, { ...options, headers })

  if (!res.ok) {
    let code = 'error'
    let message = res.statusText || 'Error de red'
    try {
      const body = await res.json()
      code = body.error ?? code
      message = body.message ?? message
    } catch {
      // respuesta sin cuerpo JSON; se conserva el statusText
    }
    throw new ApiError(res.status, code, message)
  }

  if (res.status === 204) return undefined as T
  return (await res.json()) as T
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'POST',
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
  patch: <T>(path: string, body?: unknown) =>
    request<T>(path, {
      method: 'PATCH',
      body: body === undefined ? undefined : JSON.stringify(body),
    }),
}
