import type { Request, Response, NextFunction } from 'express';

const DEFAULT_MIN_MS = 1000;
const DEFAULT_MAX_MS = 2000;

function parseIntOrNull(value: unknown): number | null {
  if (typeof value !== 'string' || value.trim() === '') return null;
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

export function createStartupDelayMiddleware() {
  if (process.env.STARTUP_DELAY_DISABLED === '1' || process.env.NODE_ENV === 'test') {
    return function startupDelayDisabled(
      _req: Request,
      _res: Response,
      next: NextFunction,
    ) {
      next();
    };
  }

  const startedAtMs = Date.now();
  const forcedDelayMs = parseIntOrNull(process.env.STARTUP_DELAY_MS);
  const minMs = parseIntOrNull(process.env.STARTUP_DELAY_MIN_MS) ?? DEFAULT_MIN_MS;
  const maxMs = parseIntOrNull(process.env.STARTUP_DELAY_MAX_MS) ?? DEFAULT_MAX_MS;
  const delayMs =
    forcedDelayMs ??
    (Math.floor(Math.random() * (Math.max(maxMs - minMs, 0) + 1)) + minMs);

  return function startupDelayMiddleware(
    _req: Request,
    res: Response,
    next: NextFunction,
  ) {
    const elapsedMs = Date.now() - startedAtMs;
    if (elapsedMs >= delayMs) return next();

    res.status(503).json({
      message: 'Service not ready',
    });
  };
}
