export function logInfo(message: string): void {
  console.log(`[INFO] ${new Date().toISOString()} ${message}`);
}

export function logError(message: string): void {
  console.error(`[ERROR] ${new Date().toISOString()} ${message}`);
}

export function logDebug(message: string): void {
  if (process.env.DEBUG === 'true') {
    // Nota: usa console.debug para permitir filtragem por níveis em ambientes que suportam.
    console.debug(`[DEBUG] ${new Date().toISOString()} ${message}`);
  }
}
