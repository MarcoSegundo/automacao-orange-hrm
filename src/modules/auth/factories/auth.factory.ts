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

  static employeeLogin(firstName: string, lastName: string): AuthDraft {
    const token = `${Date.now()}`.slice(-6);
    return {
      user: `${firstName.toLowerCase().slice(0, 6)}.${lastName.toLowerCase().slice(0, 6)}.${token}`,
      pass: `HrM!${token}Aa`
    };
  }
}
