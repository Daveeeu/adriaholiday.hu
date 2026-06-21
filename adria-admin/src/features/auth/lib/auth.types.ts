export type AuthUser = {
  id: string | number;
  name: string;
  email: string;
  initials: string;
  roles: string[];
  permissions: string[];
  role: string | null;
  isSuperAdmin: boolean;
};

export type AuthLoginInput = {
  email: string;
  password: string;
};

export type AuthLoginResponse = {
  token: string;
  tokenType: 'Bearer';
  user: AuthUser;
};
