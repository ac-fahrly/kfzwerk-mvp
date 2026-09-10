import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useLocation, useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useT } from '@/i18n';
import { serverError } from '@/lib/api';
import { toast } from '@/store/toast-store';

import { useAuth } from '../context/auth-context';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

type LoginValues = z.infer<typeof schema>;

export function LoginForm() {
  const { t } = useT('auth');
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);

  const from = (location.state as { from?: string } | null)?.from ?? '/';

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = handleSubmit(async (values) => {
    setPending(true);
    try {
      await login(values.email, values.password);
      toast.success(t('login.success'));
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(serverError(err, t('login.error')));
    } finally {
      setPending(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="email">{t('login.email')}</Label>
        <div className="relative">
          <Mail
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="email"
            type="email"
            autoComplete="email"
            autoFocus
            className="pl-9"
            placeholder={t('login.emailPlaceholder')}
            aria-invalid={!!errors.email}
            {...register('email')}
          />
        </div>
        {errors.email ? (
          <p className="text-sm text-destructive">{t('login.emailInvalid')}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">{t('login.password')}</Label>
        <div className="relative">
          <Lock
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            className="px-9"
            placeholder={t('login.passwordPlaceholder')}
            aria-invalid={!!errors.password}
            {...register('password')}
          />
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? t('hidePassword') : t('showPassword')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          >
            {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.password ? (
          <p className="text-sm text-destructive">{t('login.passwordRequired')}</p>
        ) : null}
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? <Loader2 size={16} className="animate-spin" /> : null}
        {pending ? t('login.loading') : t('login.submit')}
      </Button>
    </form>
  );
}
