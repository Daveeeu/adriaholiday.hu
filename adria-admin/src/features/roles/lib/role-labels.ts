/** Hungarian display names of the built-in roles; their stored names stay as they are. */
const ROLE_LABELS: Record<string, string> = {
  'Super Admin': 'Főadminisztrátor',
  Admin: 'Adminisztrátor',
  'Content Editor': 'Tartalomszerkesztő',
  'Content Manager': 'Tartalomkezelő',
  Marketing: 'Marketing',
  Operator: 'Operátor',
  'Partner Manager': 'Partnerkezelő',
  Sales: 'Értékesítő',
  Support: 'Ügyfélszolgálat',
  Viewer: 'Csak megtekintő',
};

export function getRoleLabel(name: string): string {
  return ROLE_LABELS[name] ?? name;
}
