export type User = {
  id: string;
  fullName: string;
  role: string;
  avatar?: string | null;
};

const normalizeRole = (role: string | null | undefined): string | null => {
  if (!role) {
    return null;
  }
  return role.toUpperCase();
};

export const authStore = {
  getToken: () => localStorage.getItem('accessToken'),
  setToken: (token: string) => localStorage.setItem('accessToken', token),
  getRole: () => normalizeRole(localStorage.getItem('role')),
  setRole: (role: string) => {
    const normalizedRole = normalizeRole(role);
    if (!normalizedRole) return;
    localStorage.setItem('role', normalizedRole);
  },
  getResolvedRole: () => {
    const storedRole = normalizeRole(localStorage.getItem('role'));
    if (storedRole) return storedRole;

    const user = authStore.getUser();
    return normalizeRole(user?.role);
  },
  clear: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
    localStorage.removeItem('role');
  },
  getUser: (): User | null => {
    const raw = localStorage.getItem('user');
    if (!raw || raw === 'undefined' || raw === 'null') return null; // ← himoya
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },
  setUser: (user: User) => {
    if (!user) return; // ← undefined saqlanmasin
    localStorage.setItem('user', JSON.stringify(user));
  },
};