export interface UserSession {
  id: number;
  name: string;
  email: string;
  avatar?: string;
}

const TOKEN_KEY = "controle_gastos_token";
const USER_KEY = "controle_gastos_user";

export const authStorage = {
  saveSession(token: string, user: UserSession) {
    if (typeof window === "undefined") return;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(TOKEN_KEY);
  },

  getUser(): UserSession | null {
    if (typeof window === "undefined") return null;
    const data = localStorage.getItem(USER_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  clearSession() {
    if (typeof window === "undefined") return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};
