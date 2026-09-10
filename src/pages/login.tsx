import { useState } from 'react';
import { Wrench } from 'lucide-react';
import { Navigate, useLocation } from 'react-router-dom';

import { LoginForm } from '@/features/auth/components/login-form';
import { RegisterForm } from '@/features/auth/components/register-form';
import { WorkshopHero } from '@/features/auth/components/workshop-hero';
import { useAuth } from '@/features/auth/context/auth-context';
import { LanguageToggle } from '@/components/layout/language-toggle';
import { Toaster } from '@/components/shared/toaster';
import { useT } from '@/i18n';
import { usePageTitle } from '@/lib/use-page-title';

type Mode = 'login' | 'register';

/**
 * Public auth page (no app shell): a split layout with the form on the left and
 * the branded workshop scene on the right. The same page toggles between
 * sign-in and registration. Ported from amazon-subs-fe's login module.
 *
 * It mounts its own `<Toaster />` because the shared one lives inside AppShell,
 * which an unauthenticated visitor never renders — without it, a failed
 * sign-in would fail silently.
 */
export function LoginPage() {
  const { t } = useT('auth');
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const [mode, setMode] = useState<Mode>('login');

  usePageTitle(t('login.title'));

  if (isAuthenticated) {
    const from = (location.state as { from?: string } | null)?.from ?? '/';
    return <Navigate to={from} replace />;
  }

  const isLogin = mode === 'login';
  const ns = isLogin ? 'login' : 'register';
  // Switching links: on login, offer to register; on register, offer to sign in.
  const switchPrompt = isLogin ? t('register.switchPrompt') : t('login.switchPrompt');
  const switchCta = isLogin ? t('register.switchCta') : t('login.switchCta');

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* ── Form ── */}
      <div className="relative flex flex-col justify-center px-6 py-10 sm:px-12">
        <div className="absolute right-4 top-4">
          <LanguageToggle />
        </div>

        <div className="mx-auto w-full max-w-sm">
          <div className="mb-10 flex items-center gap-2.5">
            <span className="flex size-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <Wrench size={18} />
            </span>
            <span className="text-xl font-semibold tracking-tight">{t('brand')}</span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-foreground">
            {t(`${ns}.title`)}
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">{t(`${ns}.subtitle`)}</p>

          <div className="mt-8">{isLogin ? <LoginForm /> : <RegisterForm />}</div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {switchPrompt}{' '}
            <button
              type="button"
              onClick={() => setMode(isLogin ? 'register' : 'login')}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              {switchCta}
            </button>
          </p>

          <p className="mt-10 text-center text-xs text-muted-foreground">{t('copyright')}</p>
        </div>
      </div>

      {/* ── Hero (hidden on small screens) ── */}
      <div className="relative hidden overflow-hidden bg-primary text-primary-foreground lg:block">
        <WorkshopHero />

        {/* headline — sits at the bottom so the bay scene reads above it */}
        <div className="relative z-10 flex h-full flex-col justify-end px-12 pb-16 xl:px-16">
          <h2 className="max-w-md text-4xl font-bold leading-tight">{t('hero.title')}</h2>
          <div className="mt-5 h-1 w-16 rounded-full bg-primary-foreground/60" />
          <p className="mt-5 max-w-md text-lg text-primary-foreground/75">
            {t('hero.subtitle')}
          </p>
        </div>
      </div>

      <Toaster />
    </div>
  );
}
