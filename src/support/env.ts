import dotenv from "dotenv";
import { TestMessages } from "./messages";

dotenv.config();

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(TestMessages.envVarNotInitialized(name));
  }

  return value;
}

export const env = {
  // BASE_URL pode manter default para simplificar execução local no demo público.
  // As credenciais ADMIN_USER/ADMIN_PASS são obrigatórias em runtime e
  // devem ser fornecidas via .env para execuções locais ou como Secrets no CI.
  baseUrl: process.env.BASE_URL || "https://opensource-demo.orangehrmlive.com",
  adminUser: getRequiredEnv("ADMIN_USER"),
  adminPass: getRequiredEnv("ADMIN_PASS"),
  // HEADLESS=false abre o navegador para debug; qualquer outro valor mantém execução headless.
  headless: process.env.HEADLESS !== "false"
};
