export const TokenManager = {
  setAccessToken(token: string) {
    localStorage.setItem("accessToken", token);
  },
  getAccessToken(): string | null {
    return localStorage.getItem("accessToken");
  },
  clearAccessToken() {
    localStorage.removeItem("accessToken");
  },

  setUser(user: object) {
    localStorage.setItem("user", JSON.stringify(user));
  },
  getUser(): Record<string, unknown> | null {
    try {
      const u = localStorage.getItem("user");
      return u ? JSON.parse(u) : null;
    } catch {
      return null;
    }
  },
  clearUser() {
    localStorage.removeItem("user");
  },

  clear() {
    this.clearAccessToken();
    this.clearUser();
  },
};
