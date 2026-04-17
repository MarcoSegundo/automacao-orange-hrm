export type EmployeeDraft = {
  firstName: string;
  lastName: string;
  employeeId?: string;
};

export class EmployeeFactory {
  /**
   * Gera um rascunho único usando timestamp para reduzir colisões em ambientes compartilhados.
   */
  static unique(prefix = 'AUTO'): EmployeeDraft {
    const token = `${Date.now()}`;
    return {
      firstName: `${prefix}_FN_${token}`,
      lastName: `${prefix}_LN_${token}`,
    };
  }
}
