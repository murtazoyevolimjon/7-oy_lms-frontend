export type User = {
  id: string;
  fullName: string;
  role: string;
  avatar?: string | null;
};

export const authStore = {
  getToken: () => localStorage.getItem('accessToken'),
  setToken: (token: string) => localStorage.setItem('accessToken', token),
  clear: () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('user');
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