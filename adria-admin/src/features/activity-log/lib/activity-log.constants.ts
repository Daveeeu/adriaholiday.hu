import type { ActivityEvent, ActivityLogEntry } from './activity-log.types';

export const ACTIVITY_EVENT_LABELS: Record<ActivityEvent, string> = {
  created: 'Létrehozás',
  updated: 'Módosítás',
  deleted: 'Törlés',
  restored: 'Visszaállítás',
  login: 'Belépés',
  login_failed: 'Sikertelen belépés',
  logout: 'Kijelentkezés',
  ai_query: 'AI lekérdezés',
};

export const ACTIVITY_EVENT_BADGE_CLASSES: Record<ActivityEvent, string> = {
  created: 'border-emerald-200 bg-emerald-50 text-emerald-700',
  updated: 'border-sky-200 bg-sky-50 text-sky-700',
  deleted: 'border-rose-200 bg-rose-50 text-rose-700',
  restored: 'border-violet-200 bg-violet-50 text-violet-700',
  login: 'border-slate-200 bg-slate-50 text-slate-700',
  login_failed: 'border-amber-200 bg-amber-50 text-amber-800',
  logout: 'border-slate-200 bg-white text-slate-500',
  ai_query: 'border-indigo-200 bg-indigo-50 text-indigo-700',
};

const LOGIN_FAILURE_REASONS: Record<string, string> = {
  invalid_credentials: 'Hibás e-mail cím vagy jelszó',
  inactive: 'A fiók le van tiltva',
  no_mcp_access: 'Nincs AI asszisztens jogosultság',
};

/** The access-change entries written by the backend's AccessActivityLogger. */
const ACCESS_DESCRIPTIONS: Record<string, string> = {
  user_access: 'Szerepkörök és jogosultságok',
  role_access: 'Szerepkör jogosultságai',
  password_changed: 'Jelszócsere',
};

const FIELD_LABELS: Record<string, string> = {
  roles: 'Szerepkörök',
  permissions: 'Jogosultságok',
  denied_permissions: 'Tiltott jogosultságok',
  password: 'Jelszó',
  name: 'Név',
  title: 'Cím',
  email: 'E-mail',
  is_active: 'Aktív',
  active: 'Aktív',
  status: 'Státusz',
  slug: 'URL azonosító',
  price: 'Ár',
  start_date: 'Kezdő dátum',
  end_date: 'Záró dátum',
  deleted_at: 'Törölve',
  created_at: 'Létrehozva',
};

export function activityEventLabel(entry: ActivityLogEntry) {
  return entry.event ? ACTIVITY_EVENT_LABELS[entry.event] : entry.description;
}

export function activityFieldLabel(field: string) {
  return FIELD_LABELS[field] ?? field;
}

export function loginFailureReasonLabel(reason: string | null) {
  return reason ? (LOGIN_FAILURE_REASONS[reason] ?? reason) : null;
}

export function accessChangeLabel(description: string) {
  return ACCESS_DESCRIPTIONS[description] ?? null;
}

/** "tool · key: value, …" for an AI assistant's MCP tool call. */
export function describeAiQuery(entry: ActivityLogEntry) {
  if (entry.event !== 'ai_query' || !entry.context.aiTool) return null;

  const args = Object.entries(entry.context.aiArguments ?? {})
    .map(([key, value]) => `${key}: ${String(value)}`)
    .join(', ');

  return args ? `${entry.context.aiTool} · ${args}` : entry.context.aiTool;
}

export function isAuthEntry(entry: ActivityLogEntry) {
  return (
    entry.event === 'login' ||
    entry.event === 'login_failed' ||
    entry.event === 'logout'
  );
}

export function formatChangeValue(
  value: ActivityLogEntry['changes'][number]['old'],
) {
  if (value === null || value === '') return '—';
  if (typeof value === 'boolean') return value ? 'Igen' : 'Nem';

  return String(value);
}

/** A short, human summary of the browser behind a user-agent string. */
export function describeUserAgent(userAgent: string | null) {
  if (!userAgent) return null;

  const browser =
    [
      ['Edg/', 'Edge'],
      ['OPR/', 'Opera'],
      ['Firefox/', 'Firefox'],
      ['Chrome/', 'Chrome'],
      ['Safari/', 'Safari'],
    ].find(([token]) => userAgent.includes(token))?.[1] ??
    'Ismeretlen böngésző';

  const system = [
    ['iPhone', 'iPhone'],
    ['iPad', 'iPad'],
    ['Android', 'Android'],
    ['Mac OS X', 'macOS'],
    ['Windows', 'Windows'],
    ['Linux', 'Linux'],
  ].find(([token]) => userAgent.includes(token))?.[1];

  return system ? `${browser} · ${system}` : browser;
}
