export function Log(
  stack: "backend" | "frontend",
  level: "debug" | "info" | "warn" | "error" | "fatal",
  packageName: string,
  message: string,
): void;
