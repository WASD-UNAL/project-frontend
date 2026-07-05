import { useEffect, useId, useState } from "react";
import type { FormEvent } from "react";
import { createPortal } from "react-dom";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, Mail, X } from "lucide-react";
import { useAuth } from "../../hooks/useAuth";
import { login } from "../../services/authService";
import { ApiError } from "../../services/apiClient";

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
}

export function LoginModal({ open, onClose }: LoginModalProps) {
  const { setToken } = useAuth();
  const navigate = useNavigate();
  const emailId = useId();
  const passwordId = useId();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape" && !busy) onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, busy, onClose]);

  if (!open) return null;

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const { token } = await login({ identifier: email.trim(), password });
      setToken(token);
      onClose();
      navigate("/dashboard");
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        console.error("Fallo inesperado en el login:", err);
        setError(
          "No pudimos iniciar sesión. Revisa tu conexión e inténtalo de nuevo.",
        );
      }
      setBusy(false);
    }
  }

  return createPortal(
    <div
      className="fixed inset-0 z-[70] overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="Iniciar sesión"
    >
      <button
        type="button"
        aria-label="Cerrar"
        onClick={() => !busy && onClose()}
        className="fixed inset-0 bg-bg/70 backdrop-blur-sm"
      />

      <div className="relative flex min-h-full items-center justify-center px-4 py-8">
        <div className="animate-card-rise relative w-full max-w-md overflow-hidden rounded-2xl border border-line bg-surface shadow-[0_30px_80px_-20px_rgba(0,0,0,0.8)]">
          <div className="h-1 w-full bg-ember" />

          <button
            type="button"
            aria-label="Cerrar"
            onClick={() => !busy && onClose()}
            disabled={busy}
            className="absolute top-5 right-5 text-muted transition-colors hover:text-ink disabled:opacity-40"
          >
            <X className="size-5" />
          </button>

          <div className="p-6 sm:p-8">
            <p className="font-mono text-xs tracking-[0.3em] text-ember uppercase">
              Bienvenido de vuelta
            </p>
            <h2 className="mt-2 font-display text-4xl tracking-wide text-ink">
              Iniciar sesión
            </h2>

            <form onSubmit={handleSubmit} className="mt-7 space-y-5" noValidate>
              <div className="space-y-2">
                <label
                  htmlFor={emailId}
                  className="block font-mono text-xs tracking-[0.25em] text-muted uppercase"
                >
                  Correo electrónico
                </label>
                <div className="group relative">
                  <Mail className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted transition-colors group-focus-within:text-ember" />
                  <input
                    id={emailId}
                    // Foco inicial en el email al abrir el diálogo modal.
                    autoFocus
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="w-full rounded-xl border border-line bg-surface-soft py-3 pr-4 pl-11 text-sm text-ink placeholder:text-muted/60 transition-colors focus:border-ember focus:outline-none"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label
                  htmlFor={passwordId}
                  className="block font-mono text-xs tracking-[0.25em] text-muted uppercase"
                >
                  Contraseña
                </label>
                <div className="group relative">
                  <Lock className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted transition-colors group-focus-within:text-ember" />
                  <input
                    id={passwordId}
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-line bg-surface-soft py-3 pr-12 pl-11 text-sm text-ink placeholder:text-muted/60 transition-colors focus:border-ember focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    aria-label={
                      showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
                    }
                    className="absolute top-1/2 right-3 -translate-y-1/2 rounded-md p-1 text-muted transition-colors hover:text-ink"
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <p
                  role="alert"
                  className="rounded-xl border border-danger/40 bg-danger-soft px-4 py-3 text-sm text-danger"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={busy}
                className="w-full rounded-full bg-ember px-6 py-3 text-sm font-bold tracking-wide text-bg transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:hover:scale-100"
              >
                {busy ? "Entrando…" : "Entrar"}
              </button>
            </form>

            <p className="mt-6 text-center text-xs text-muted">
              ¿Aún no eres miembro?{" "}
              <a
                href="#planes"
                onClick={() => !busy && onClose()}
                className="font-semibold text-ember transition-colors hover:text-ink"
              >
                Ver planes
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
