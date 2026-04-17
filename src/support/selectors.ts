/**
 * Seletors reutilizáveis da UI.
 *
 * Deve conter apenas expressões/seletores do DOM. Texto visível (labels/placeholders)
 * permanece em `src/support/ui-text.ts` (UiText).
 */
export const Selectors = {
  oxdInputGroup: '.oxd-input-group',
  /** Retorna um seletor de input pelo placeholder (ex.: input[placeholder="..."]) */
  inputByPlaceholder: (placeholder: string) => `input[placeholder="${placeholder}"]`,
} as const;
