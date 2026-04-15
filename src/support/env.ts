import dotenv from "dotenv";

dotenv.config();

export const env = {
  // Defaults permitem execução local rápida; CI pode sobrescrever por variáveis de ambiente.
  baseUrl: process.env.BASE_URL || "https://opensource-demo.orangehrmlive.com",
  adminUser: process.env.ADMIN_USER || "Admin",
  adminPass: process.env.ADMIN_PASS || "admin123",
  // HEADLESS=false abre o navegador para debug; qualquer outro valor mantém execução headless.
  headless: process.env.HEADLESS !== "false"
};
