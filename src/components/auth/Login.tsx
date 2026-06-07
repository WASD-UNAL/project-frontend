import React, { useState } from "react";

interface LoginProps {
  inline?: boolean;
  onClose?: () => void;
}

const Login: React.FC<LoginProps> = ({ inline = false, onClose }) => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Visual-only: no authentication logic here
  };

  const card = (
    <div
      className={`relative w-full ${inline ? "w-[90vw] max-w-3xl p-10" : "max-w-md p-8"} bg-zinc-900/60 backdrop-blur-sm border border-zinc-800 rounded-xl shadow-lg`}
    >
      {onClose && (
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-100"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      )}

      <h2 className="text-2xl font-semibold mb-1">Accede a tu cuenta</h2>
      <p className="text-sm text-zinc-400 mb-6"></p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <label className="block">
          <input
            type="email"
            aria-label="Usuario"
            placeholder="Usuario"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="mt-1 block w-full rounded-md bg-zinc-800 border border-zinc-700 px-3 py-2 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </label>

        <label className="block">
          <div className="relative mt-1">
            <input
              type={showPassword ? "text" : "password"}
              aria-label="Contraseña"
              placeholder="Contraseña"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="block w-full rounded-md bg-zinc-800 border border-zinc-700 px-3 py-2 pr-10 text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-green-400"
            />

            <button
              type="button"
              aria-label={showPassword ? "Hide password" : "Show password"}
              onClick={() => setShowPassword((s) => !s)}
              className="absolute inset-y-0 right-2 flex items-center text-zinc-300 hover:text-zinc-100"
            >
              {showPassword ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13.875 18.825A10.05 10.05 0 0112 19c-5.523 0-10-4.477-10-10 0-1.054.156-2.067.446-3.006M3 3l18 18"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                  />
                </svg>
              )}
            </button>
          </div>
        </label>

        <div className="flex items-center justify-between">
          <div />
          <button
            type="button"
            className="text-sm text-lime-300 hover:underline"
          >
            Olvidé mi contraseña
          </button>
        </div>

        <button
          type="submit"
          className="w-full inline-flex justify-center items-center gap-2 py-2 px-4 rounded-md bg-gradient-to-r from-lime-400 to-emerald-500 text-black font-medium hover:opacity-95"
        >
          INGRESAR
        </button>

        <p className="mt-3 text-sm text-zinc-400">
          Si tiene problemas con el ingreso, comuníquese al: 55 1234 5678
        </p>
      </form>
    </div>
  );

  if (inline) return card;

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      {card}
    </div>
  );
};

export default Login;
