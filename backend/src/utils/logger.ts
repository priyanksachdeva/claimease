export const logger = {
  info: (message: string, ...args: any[]) => {
    console.log(`[INFO] ${message}`, ...args);
  },
  error: (message: string, ...args: any[]) => {
    console.error(`[ERROR] ${message}`, ...args);
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(`[WARN] ${message}`, ...args);
  },
};

export function sanitizeError(error: any) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      code: (error as any).code,
    };
  }
  return { message: String(error) };
}
