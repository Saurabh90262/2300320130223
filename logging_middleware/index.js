const EVALUATION_SERVICE_URL =
  process.env.EVALUATION_SERVICE_URL ||
  "http://4.224.186.213/evaluation-service";

const LEVELS = new Set(["debug", "info", "warn", "error", "fatal"]);
const STACKS = new Set(["backend", "frontend"]);
const BACKEND_PACKAGES = new Set([
  "cache",
  "controller",
  "cron_job",
  "db",
  "domain",
]);
const FRONTEND_PACKAGES = new Set([
  "component",
  "hook",
  "page",
  "state",
  "style",
  "auth",
  "config",
  "middleware",
  "utils",
]);

let cachedToken =
  (typeof process !== "undefined" &&
    (process.env.EVALUATION_ACCESS_TOKEN ||
      process.env.NEXT_PUBLIC_EVALUATION_ACCESS_TOKEN)) ||
  null;
let authInFlight = null;

function isValidPackage(stack, packageName) {
  if (stack === "backend") return BACKEND_PACKAGES.has(packageName);
  return FRONTEND_PACKAGES.has(packageName);
}

async function getAccessToken() {
  if (cachedToken) return cachedToken;
  if (authInFlight) return authInFlight;

  const {
    EVALUATION_EMAIL,
    EVALUATION_NAME,
    EVALUATION_ROLL_NO,
    EVALUATION_ACCESS_CODE,
    EVALUATION_CLIENT_ID,
    EVALUATION_CLIENT_SECRET,
  } = process.env;

  if (!EVALUATION_CLIENT_ID || !EVALUATION_CLIENT_SECRET) {
    return null;
  }

  authInFlight = fetch(`${EVALUATION_SERVICE_URL}/auth`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      email: EVALUATION_EMAIL,
      name: EVALUATION_NAME,
      rollNo: EVALUATION_ROLL_NO,
      accessCode: EVALUATION_ACCESS_CODE,
      clientID: EVALUATION_CLIENT_ID,
      clientSecret: EVALUATION_CLIENT_SECRET,
    }),
  })
    .then((response) => response.json())
    .then((data) => {
      cachedToken = data.access_token || null;
      return cachedToken;
    })
    .catch(() => null)
    .finally(() => {
      authInFlight = null;
    });

  return authInFlight;
}

async function sendLog(stack, level, packageName, message) {
  const headers = { "Content-Type": "application/json" };
  const token = await getAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  await fetch(`${EVALUATION_SERVICE_URL}/logs`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      stack,
      level,
      package: packageName,
      message: String(message),
    }),
  });
}

function Log(stack, level, packageName, message) {
  if (!STACKS.has(stack)) return;
  if (!LEVELS.has(level)) return;
  if (!isValidPackage(stack, packageName)) return;
  if (message === undefined || message === null) return;

  sendLog(stack, level, packageName, message).catch(() => {});
}

module.exports = { Log };
