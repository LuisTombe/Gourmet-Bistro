import 'dotenv/config';
import crypto from 'node:crypto';
import mysql from 'mysql2/promise';
import {ZodError} from 'zod';

const port = process.env.MYSQL_PORT || 3306;
export function poolFor(service) {
  const settings = {
    usuarios: ['MYSQL_USERS_USER', 'MYSQL_USERS_PASSWORD', 'restaurante_usuarios'],
    catalogo: ['MYSQL_CATALOG_USER', 'MYSQL_CATALOG_PASSWORD', 'restaurante_catalogo'],
    pedidos: ['MYSQL_ORDERS_USER', 'MYSQL_ORDERS_PASSWORD', 'restaurante_pedidos'],
  }[service];
  if (!settings) throw new Error('Servicio MySQL desconocido');
  for (const k of settings.slice(0,2)) if (!process.env[k]) throw new Error(`Falta ${k}`);
  return mysql.createPool({host:process.env.MYSQL_HOST||'127.0.0.1',port,user:process.env[settings[0]],password:process.env[settings[1]],database:settings[2],waitForConnections:true,connectionLimit:8,decimalNumbers:false});
}
export const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex');
export const issueToken = () => crypto.randomBytes(32).toString('hex');
export function cookieValue(req, name='gb_session') {
  const chunk=(req.headers.cookie||'').split(';').map(v=>v.trim()).find(v=>v.startsWith(`${name}=`));
  return chunk ? decodeURIComponent(chunk.slice(name.length+1)) : null;
}
export function sessionCookie(token, expiresHours=8) {
  const attrs=['Path=/','HttpOnly','SameSite=Lax',`Max-Age=${Math.round(expiresHours*3600)}`];
  if (process.env.NODE_ENV==='production') attrs.push('Secure');
  return `gb_session=${encodeURIComponent(token)}; ${attrs.join('; ')}`;
}
export function clearSessionCookie() {
  return `gb_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${process.env.NODE_ENV==='production'?'; Secure':''}`;
}
export function apiError(err,req,res,next) {
  if (res.headersSent) return next(err);
  if(err instanceof ZodError) return res.status(422).json({error:'Datos inválidos',issues:err.issues.map(x=>({field:x.path.join('.'),message:x.message}))});
  if (err?.code==='ER_DUP_ENTRY') return res.status(409).json({error:'Registro duplicado o mesa ocupada'});
  if (err?.code==='ER_CHECK_CONSTRAINT_VIOLATED') return res.status(422).json({error:'Los datos no cumplen las restricciones'});
  const status=Number.isInteger(err?.status)?err.status:500;
  if(status>=500) console.error(`[${req.method} ${req.path}]`,err?.message||err);
  res.status(status).json({error:status>=500?'Error interno del servidor':err.message});
}
export function asyncRoute(fn) { return (req,res,next) => Promise.resolve(fn(req,res,next)).catch(next); }
export function internalOnly(req,res,next) {
  const configured=process.env.INTERNAL_SERVICE_KEY;
  if(!configured||configured.length<32) return next(Object.assign(new Error('INTERNAL_SERVICE_KEY no configurado con seguridad'),{status:500}));
  const supplied=req.get('x-service-key')||'';
  if(!supplied || supplied.length !== configured.length || !crypto.timingSafeEqual(Buffer.from(supplied),Buffer.from(configured))) return res.status(403).json({error:'Acceso interno denegado'});
  next();
}
export async function internalFetch(url,{method='GET',body,headers}={}) {
  if(!process.env.INTERNAL_SERVICE_KEY || process.env.INTERNAL_SERVICE_KEY.length<32) throw Object.assign(new Error('Clave interna no configurada'),{status:500});
  let response;
  try {
    response=await fetch(url,{method,headers:{'x-service-key':process.env.INTERNAL_SERVICE_KEY,...(body?{'content-type':'application/json'}:{}),...headers},body:body?JSON.stringify(body):undefined,signal:AbortSignal.timeout(4500)});
  } catch(e) { throw Object.assign(new Error(`No se pudo comunicar con el microservicio: ${new URL(url).host}`),{status:503}); }
  const data=await response.json().catch(()=>({}));
  if(!response.ok) throw Object.assign(new Error(data.error||'Error en microservicio'),{status:response.status>=500?503:response.status});
  return data;
}
export function requireRole(...allowed) {
  return asyncRoute(async(req,res,next)=>{
    const token=cookieValue(req);
    if(!token) return res.status(401).json({error:'Inicia sesión'});
    const result=await internalFetch(`${process.env.USERS_URL||'http://127.0.0.1:4001'}/internal/auth/verify`,{method:'POST',body:{token}});
    if (!allowed.includes(result.user.rol)) return res.status(403).json({error:'Permisos insuficientes'});
    req.actor=result.user;next();
  });
}
export async function namedLocks(conn,keys,fn) {
  const locked=[];
  try {
    for(const key of [...new Set(keys)].sort()) {
      const [[r]]=await conn.query('SELECT GET_LOCK(?,5) AS locked',[key]);
      if(Number(r.locked)!==1) throw Object.assign(new Error('Operación concurrente; inténtalo nuevamente'),{status:409});
      locked.push(key);
    }
    return await fn();
  } finally {
    for(const key of locked.reverse()) {
      try {await conn.query('SELECT RELEASE_LOCK(?)',[key]);} catch {}
    }
  }
}
export const baseUrl=(key,fallback)=>process.env[key]||fallback;
