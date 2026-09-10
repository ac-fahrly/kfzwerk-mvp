import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { Building2, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useT } from '@/i18n';
import { serverError } from '@/lib/api';
import { toast } from '@/store/toast-store';

import { useAuth } from '../context/auth-context';

/** The 8-character floor mirrors the server's check in auth.controller.ts —
 * this side is UX only, the encrypted payload bypasses the DTO pipe. */
const schema = z
  .object({
    werkstatt: z.string().optional(),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(1),
  })
  .refine((d) => d.password === d.confirmPassword, {
    path: ['confirmPassword'],
    message: 'mismatch',
  });

type RegisterValues = z.infer<typeof schema>;

export function RegisterForm() {
  const { t } = useT('auth');
  const navigate = useNavigate();
  const { register: createAccount } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pending, setPending] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterValues>({
    resolver: zodResolver(schema),
    defaultValues: { werkstatt: '', email: '', password: '', confirmPassword: '' },
  });

  const onSubmit = handleSubmit(async ({ email, password, werkstatt }) => {
    setPending(true);
    try {
      await createAccount(email, password, werkstatt || undefined);
      toast.success(t('register.success'));
      navigate('/', { replace: true });
    } catch (err) {
      // Prefer the backend's message — it distinguishes "email already exists"
      // from a generic failure.
      toast.error(serverError(err, t('register.error')));
    } finally {
      setPending(false);
    }
  });

  return (
    <form onSubmit={onSubmit} className="space-y-4" noValidate>
      <div className="space-y-2">
        <Label htmlFor="reg-werkstatt">{t('register.werkstatt')}</Label>
        <div className="relative">
          <Building2
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="reg-werkstatt"
            autoComplete="organization"
            className="pl-9"
            placeholder={t('register.werkstattPlaceholder')}
            {...register('werkstatt')}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-email">{t('register.email')}</Label>
        <div className="relative">
          <Mail
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="reg-email"
            type="email"
            autoComplete="email"
            className="pl-9"
            placeholder={t('register.emailPlaceholder')}
            aria-invalid={!!errors.email}
            {...register('email')}
          />
        </div>
        {errors.email ? (
          <p className="text-sm text-destructive">{t('register.emailInvalid')}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-password">{t('register.password')}</Label>
        <div className="relative">
          <Lock
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="reg-password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="new-password"
            className="px-9"
            placeholder={t('register.passwordPlaceholder')}
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
          <p className="text-sm text-destructive">{t('register.passwordTooShort')}</p>
        ) : (
          <p className="text-xs text-muted-foreground">{t('register.passwordHint')}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="reg-confirm">{t('register.confirmPassword')}</Label>
        <div className="relative">
          <Lock
            size={16}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          />
          <Input
            id="reg-confirm"
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            className="px-9"
            placeholder={t('register.confirmPlaceholder')}
            aria-invalid={!!errors.confirmPassword}
            {...register('confirmPassword')}
          />
          <button
            type="button"
            onClick={() => setShowConfirm((s) => !s)}
            aria-label={showConfirm ? t('hidePassword') : t('showPassword')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors hover:text-foreground"
          >
            {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        </div>
        {errors.confirmPassword ? (
          <p className="text-sm text-destructive">{t('register.mismatch')}</p>
        ) : null}
      </div>

      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? <Loader2 size={16} className="animate-spin" /> : null}
        {pending ? t('register.loading') : t('register.submit')}
      </Button>
    </form>
  );
}
