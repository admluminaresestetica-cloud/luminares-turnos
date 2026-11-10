import { SquareCheck, Loader2 } from 'lucide-react';

interface AuthSectionProps {
  onGoogleLogin: () => void;
  onFacebookLogin: () => void;
  cargandoGoogle: boolean;
  cargandoFacebook: boolean;
}

export default function AuthSection({
  onGoogleLogin,
  onFacebookLogin,
  cargandoGoogle,
  cargandoFacebook,
}: AuthSectionProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-stone-200/60 dark:border-zinc-800 bg-white/80 dark:bg-zinc-900/70 p-6 text-center shadow-xl shadow-stone-900/5">
      <div aria-hidden className="pointer-events-none absolute -top-16 left-1/2 -translate-x-1/2 w-56 h-56 rounded-full bg-primary/10 blur-3xl" />
      <div className="relative space-y-4">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-primary/10 text-primary ring-1 ring-primary/15 flex items-center justify-center">
          <SquareCheck className="w-5 h-5" />
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-bold text-stone-900 dark:text-zinc-50">Entrá a tu cuenta</p>
          <p className="text-xs leading-relaxed text-stone-500 dark:text-zinc-400 font-medium">
            Con tu cuenta accedés a tus turnos y compras, y empezás a acumular puntos.
          </p>
        </div>

        {/* Botón Google */}
        <button
          type="button"
          onClick={onGoogleLogin}
          disabled={cargandoGoogle}
          className="w-full flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl text-sm font-bold
                     bg-stone-900 text-white hover:bg-stone-800
                     dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-white
                     shadow-lg shadow-stone-900/15 dark:shadow-black/30
                     active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
        >
          {cargandoGoogle ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Conectando con Google...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden>
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
              </svg>
              <span>Continuar con Google</span>
            </>
          )}
        </button>

        {/* Botón Facebook */}
        <button
          type="button"
          onClick={onFacebookLogin}
          disabled={cargandoFacebook}
          className="w-full mt-2.5 flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-2xl text-sm font-bold
                     bg-[#1877F2] text-white hover:bg-[#166fe5]
                     shadow-lg shadow-[#1877F2]/25
                     active:scale-[0.98] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed
                     focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1877F2]/50"
        >
          {cargandoFacebook ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Conectando con Facebook...</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden>
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              <span>Continuar con Facebook</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}