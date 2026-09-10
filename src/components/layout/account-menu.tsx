import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/features/auth/context/auth-context';
import { useT } from '@/i18n';
import { toast } from '@/store/toast-store';

/** Topbar account menu: who is signed in, and the way out. */
export function AccountMenu() {
  const { t } = useT('auth');
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function onLogout() {
    logout();
    toast.success(t('account.loggedOut'));
    navigate('/login', { replace: true });
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label={t('account.menu')}>
          <User size={18} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <div className="text-xs text-muted-foreground">{t('account.signedInAs')}</div>
          <div className="mt-0.5 truncate text-sm font-medium">{user?.email ?? '—'}</div>
          {user?.werkstatt ? (
            <div className="mt-0.5 truncate text-xs text-muted-foreground">
              {user.werkstatt}
            </div>
          ) : null}
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onSelect={onLogout}>
          <LogOut size={16} />
          {t('account.logout')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
