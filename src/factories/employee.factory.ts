export type EmployeeDraft = {
  firstName: string;
  lastName: string;
  employeeId?: string;
};

export class EmployeeFactory {
  static unique(prefix = "AUTO"): EmployeeDraft {
    // Token temporal reduz colisão de massa no ambiente demo compartilhado.
    const token = `${Date.now()}`;
    return {
      firstName: `${prefix}_FN_${token}`,
      lastName: `${prefix}_LN_${token}`
    };
  }
}
