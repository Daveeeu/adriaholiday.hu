import { LogIn, LogOut, ShieldCheck, UserCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { t } from '@/i18n';
import { useAuthStore } from '@/store/auth-store';

export function UserNav() {
  const user = useAuthStore((state) => state.user);
  const role = useAuthStore((state) => state.user?.role ?? null);
  const signOut = useAuthStore((state) => state.signOut);
  const navigate = useNavigate();
  const permissions = user?.permissions ?? [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-3 rounded-xl border bg-card px-3 py-2 text-left transition-colors hover:bg-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
          <Avatar className="size-9">
            <AvatarFallback>{user?.initials ?? 'GU'}</AvatarFallback>
          </Avatar>
          <div className="hidden text-sm md:block">
            <p className="font-medium text-foreground">
              {user?.name ?? t('layout.user.guest')}
            </p>
            <p className="text-muted-foreground">
              {role ?? t('layout.user.inactive')}
            </p>
          </div>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64">
        <DropdownMenuLabel>
          <div className="space-y-1">
            <p className="font-medium">
              {user?.name ?? t('layout.user.noActiveUser')}
            </p>
            <p className="text-xs font-normal text-muted-foreground">
              {user?.email ?? t('layout.user.loginHint')}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() =>
            toast.info(
              user
                ? `${user.name} • ${user.email}`
                : t('layout.user.noActiveUser'),
            )
          }
        >
          <UserCircle2 className="size-4" />
          {t('layout.user.profile')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            toast.info(
              permissions.length
                ? permissions.join(', ')
                : t('layout.user.permissions'),
            )
          }
        >
          <ShieldCheck className="size-4" />
          {t('layout.user.permissions')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        {user ? (
          <DropdownMenuItem
            onClick={async () => {
              await signOut();
              navigate('/', { replace: true });
              toast.success(t('layout.user.signedOut'));
            }}
          >
            <LogOut className="size-4" />
            {t('layout.user.signOut')}
          </DropdownMenuItem>
        ) : (
          <DropdownMenuItem
            onClick={() => {
              navigate('/');
            }}
          >
            <LogIn className="size-4" />
            {t('layout.user.signIn')}
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
