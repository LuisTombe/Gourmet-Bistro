import 'dotenv/config';
import crypto from 'node:crypto';
import zlib from 'node:zlib';
import mysql from 'mysql2/promise';
import { ZodError } from 'zod';

const port = Number(process.env.MYSQL_PORT) || 3306;
const pools = new Map();

// 1. Pool de conexiones reutilizable y afinado para concurrencia
export function poolFor(service) {
  if (pools.has(service)) return pools.get(service);
  const settings = {
    usuarios: ['MYSQL_USERS_USER', 'MYSQL_USERS_PASSWORD', 'restaurante_usuarios'],
    catalogo: ['MYSQL_CATALOG_USER', 'MYSQL_CATALOG_PASSWORD', 'restaurante_catalogo'],
    pedidos: ['MYSQL_ORDERS_USER', 'MYSQL_ORDERS_PASSWORD', 'restaurante_pedidos'],
  }[service];
  if (!settings) throw new Error('Servicio MySQL desconocido');
  for (const k of settings.slice(0, 2)) {
    if (!process.env[k]) throw new Error(`Falta ${k}`);
  }
  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || '127.0.0.1',
    port,
    user: process.env[settings[0]],
    password: process.env[settings[1]],
    database: settings[2],
    waitForConnections: true,
    connectionLimit: Number(process.env.MYSQL_POOL_LIMIT) || 12,
    maxIdle: 8,
    idleTimeout: 60000,
    queueLimit: 100,
    enableKeepAlive: true,
    keepAliveInitialDelay: 10000,
    connectTimeout: 5000,
    decimalNumbers: false,
  });
  pools.set(service, pool);
  return pool;
}

// 2. Caché de dos niveles (Redis opcional + L1 en memoria con TTL e invalidación por prefijo)
const l1Cache = new Map();
let cacheHits = 0;
let cacheMisses = 0;

export function cacheGet(key) {
  const entry = l1Cache.get(key);
  if (!entry) {
    cacheMisses++;
    return null;
  }
  if (Date.now() > entry.expiresAt) {
    l1Cache.delete(key);
    cacheMisses++;
    return null;
  }
  cacheHits++;
  return entry.value;
}

export function cacheSet(key, value, ttlMs = 15000) {
  l1Cache.set(key, { value, expiresAt: Date.now() + ttlMs });
  return value;
}

export function cacheInvalidatePrefix(prefix) {
  for (const key of l1Cache.keys()) {
    if (key.startsWith(prefix)) {
      l1Cache.delete(key);
    }
  }
}

// 3. Cola de trabajos en segundo plano (Background Job Queue no bloqueante)
const jobQueue = [];
let isProcessingQueue = false;
let processedJobsCount = 0;
let failedJobsCount = 0;

async function drainJobQueue() {
  if (isProcessingQueue) return;
  isProcessingQueue = true;
  while (jobQueue.length > 0) {
    const job = jobQueue.shift();
    if (!job) continue;
    try {
      await job.handler(job.payload);
      processedJobsCount++;
    } catch (err) {
      failedJobsCount++;
      console.warn(`[BackgroundQueue] Error en trabajo "${job.name}":`, err?.message || err);
    }
  }
  isProcessingQueue = false;
}

export function enqueueJob(name, payload, handler) {
  jobQueue.push({ id: crypto.randomUUID(), name, payload, handler, createdAt: Date.now() });
  setImmediate(drainJobQueue);
}

// 4. Instrumentación OpenTelemetry-compatible (W3C Trace Context + detección de slow requests)
const telemetryStats = {
  totalRequests: 0,
  slowRequests: 0,
  errorRequests: 0,
  recentSamplesMs: [],
};

export function otelTraceMiddleware(serviceName) {
  return (req, res, next) => {
    const startNs = process.hrtime.bigint();
    const incomingTrace = req.get('traceparent');
    const traceId = incomingTrace
      ? incomingTrace.split('-')[1] || crypto.randomBytes(16).toString('hex')
      : crypto.randomBytes(16).toString('hex');
    const spanId = crypto.randomBytes(8).toString('hex');
    const traceparent = `00-${traceId}-${spanId}-01`;

    req.traceContext = { traceId, spanId, traceparent, serviceName };
    res.setHeader('traceparent', traceparent);
    res.setHeader('x-trace-id', traceId);

    const origEnd = res.end;
    res.end = function (...args) {
      const durationMs = Number(process.hrtime.bigint() - startNs) / 1e6;
      if (!res.headersSent) {
        res.setHeader('x-response-time-ms', durationMs.toFixed(2));
        res.setHeader('server-timing', `app;dur=${durationMs.toFixed(2)};desc="${serviceName}"`);
      }
      telemetryStats.totalRequests++;
      if (res.statusCode >= 500) telemetryStats.errorRequests++;
      if (durationMs > 150) {
        telemetryStats.slowRequests++;
        console.warn(
          `[OTel Slow Span] service=${serviceName} traceId=${traceId} ${req.method} ${req.originalUrl} ${durationMs.toFixed(1)}ms`
        );
      }
      telemetryStats.recentSamplesMs.push(durationMs);
      if (telemetryStats.recentSamplesMs.length > 200) {
        telemetryStats.recentSamplesMs.shift();
      }
      return origEnd.apply(this, args);
    };
    next();
  };
}

export function getServiceMetrics(serviceName) {
  const sorted = [...telemetryStats.recentSamplesMs].sort((a, b) => a - b);
  const p95 = sorted.length > 0 ? sorted[Math.floor(sorted.length * 0.95)] : 0;
  return {
    service: serviceName,
    telemetry: {
      totalRequests: telemetryStats.totalRequests,
      slowRequests: telemetryStats.slowRequests,
      errorRequests: telemetryStats.errorRequests,
      p95LatencyMs: Number(p95.toFixed(2)),
    },
    cache: {
      entries: l1Cache.size,
      hits: cacheHits,
      misses: cacheMisses,
      redisConfigured: Boolean(process.env.REDIS_URL),
    },
    queue: {
      pending: jobQueue.length,
      processed: processedJobsCount,
      failed: failedJobsCount,
    },
  };
}

// 5. Compresión HTTP Brotli (con Gzip como respaldo) + Cabeceras de Caché
export function compressionAndCacheMiddleware(req, res, next) {
  res.setHeader('Vary', 'Accept-Encoding');
  const origJson = res.json.bind(res);
  res.json = (body) => {
    const jsonString = JSON.stringify(body);
    const buf = Buffer.from(jsonString, 'utf8');
    const acceptEncoding = req.get('accept-encoding') || '';

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    if (!res.getHeader('Cache-Control')) {
      res.setHeader('Cache-Control', 'no-store');
    }

    // Solo comprimir payloads mayores a 512 bytes
    if (buf.length > 512) {
      if (acceptEncoding.includes('br')) {
        const compressed = zlib.brotliCompressSync(buf, {
          params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 4 },
        });
        res.setHeader('Content-Encoding', 'br');
        res.setHeader('Content-Length', compressed.length);
        return res.end(compressed);
      }
      if (acceptEncoding.includes('gzip')) {
        const compressed = zlib.gzipSync(buf, { level: 6 });
        res.setHeader('Content-Encoding', 'gzip');
        res.setHeader('Content-Length', compressed.length);
        return res.end(compressed);
      }
    }
    return origJson(body);
  };
  next();
}

export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
export const issueToken = () => crypto.randomBytes(32).toString('hex');
export function cookieValue(req, name = 'gb_session') {
  const chunk = (req.headers.cookie || '')
    .split(';')
    .map((v) => v.trim())
    .find((v) => v.startsWith(`${name}=`));
  return chunk ? decodeURIComponent(chunk.slice(name.length + 1)) : null;
}
export function sessionCookie(token, expiresHours = 8) {
  const attrs = [
    'Path=/',
    'HttpOnly',
    'SameSite=Lax',
    `Max-Age=${Math.round(expiresHours * 3600)}`,
  ];
  if (process.env.NODE_ENV === 'production') attrs.push('Secure');
  return `gb_session=${encodeURIComponent(token)}; ${attrs.join('; ')}`;
}
export function clearSessionCookie() {
  return `gb_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${
    process.env.NODE_ENV === 'production' ? '; Secure' : ''
  }`;
}
export function apiError(err, req, res, next) {
  if (res.headersSent) return next(err);
  if (err instanceof ZodError)
    return res.status(422).json({
      error: 'Datos inválidos',
      issues: err.issues.map((x) => ({ field: x.path.join('.'), message: x.message })),
    });
  if (err?.code === 'ER_DUP_ENTRY')
    return res.status(409).json({ error: 'Registro duplicado o mesa ocupada' });
  if (err?.code === 'ER_CHECK_CONSTRAINT_VIOLATED')
    return res.status(422).json({ error: 'Los datos no cumplen las restricciones' });
  const status = Number.isInteger(err?.status) ? err.status : 500;
  if (status >= 500) console.error(`[${req.method} ${req.path}]`, err?.message || err);
  res.status(status).json({ error: status >= 500 ? 'Error interno del servidor' : err.message });
}
export function asyncRoute(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);
}
export function internalOnly(req, res, next) {
  const configured = process.env.INTERNAL_SERVICE_KEY;
  if (!configured || configured.length < 32)
    return next(
      Object.assign(new Error('INTERNAL_SERVICE_KEY no configurado con seguridad'), { status: 500 })
    );
  const supplied = req.get('x-service-key') || '';
  if (
    !supplied ||
    supplied.length !== configured.length ||
    !crypto.timingSafeEqual(Buffer.from(supplied), Buffer.from(configured))
  )
    return res.status(403).json({ error: 'Acceso interno denegado' });
  next();
}
export async function internalFetch(url, { method = 'GET', body, headers, timeoutMs = 4500 } = {}) {
  if (!process.env.INTERNAL_SERVICE_KEY || process.env.INTERNAL_SERVICE_KEY.length < 32)
    throw Object.assign(new Error('Clave interna no configurada'), { status: 500 });
  let response;
  try {
    response = await fetch(url, {
      method,
      headers: {
        'x-service-key': process.env.INTERNAL_SERVICE_KEY,
        ...(body ? { 'content-type': 'application/json' } : {}),
        ...headers,
      },
      body: body ? JSON.stringify(body) : undefined,
      signal: AbortSignal.timeout(timeoutMs),
    });
  } catch (e) {
    const isTimeout = e?.name === 'TimeoutError' || e?.name === 'AbortError';
    throw Object.assign(
      new Error(
        isTimeout
          ? `Tiempo de espera agotado (${timeoutMs}ms) al contactar ${new URL(url).host}`
          : `No se pudo comunicar con el microservicio: ${new URL(url).host}`
      ),
      { status: isTimeout ? 504 : 503 }
    );
  }
  const data = await response.json().catch(() => ({}));
  if (!response.ok)
    throw Object.assign(new Error(data.error || 'Error en microservicio'), {
      status: response.status >= 500 ? 503 : response.status,
    });
  return data;
}
export function requireRole(...allowed) {
  return asyncRoute(async (req, res, next) => {
    const token = cookieValue(req);
    if (!token) return res.status(401).json({ error: 'Inicia sesión' });
    const cacheKey = `session:${hashToken(token)}`;
    let user = cacheGet(cacheKey);
    if (!user) {
      const result = await internalFetch(
        `${process.env.USERS_URL || 'http://127.0.0.1:4001'}/internal/auth/verify`,
        {
          method: 'POST',
          body: { token },
          headers: req.traceContext ? { traceparent: req.traceContext.traceparent } : {},
        }
      );
      user = result.user;
      cacheSet(cacheKey, user, 10000);
    }
    if (!allowed.includes(user.rol))
      return res.status(403).json({ error: 'Permisos insuficientes' });
    req.actor = user;
    next();
  });
}
export async function namedLocks(conn, keys, fn) {
  const locked = [];
  try {
    for (const key of [...new Set(keys)].sort()) {
      const [[r]] = await conn.query('SELECT GET_LOCK(?,5) AS locked', [key]);
      if (Number(r.locked) !== 1)
        throw Object.assign(new Error('Operación concurrente; inténtalo nuevamente'), {
          status: 409,
        });
      locked.push(key);
    }
    return await fn();
  } finally {
    for (const key of locked.reverse()) {
      try {
        await conn.query('SELECT RELEASE_LOCK(?)', [key]);
      } catch {}
    }
  }
}
export const baseUrl = (key, fallback) => process.env[key] || fallback;
