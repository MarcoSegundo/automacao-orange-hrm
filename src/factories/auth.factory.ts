export type AuthDraft = {
  user: string;
  pass: string;
};

export class AuthFactory {
  static validAdmin(): AuthDraft {
    return {
      user: process.env.ADMIN_USER || "Admin",
      pass: process.env.ADMIN_PASS || "admin123"
    };
  }

  static invalidCredentials(): AuthDraft {
    return {
      user: process.env.ADMIN_USER || "Admin",
      pass: "senha_errada"
    };
  }
}
