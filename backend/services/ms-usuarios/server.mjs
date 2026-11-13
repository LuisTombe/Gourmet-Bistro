import 'dotenv/config';
import express from 'express';
import bcrypt from 'bcryptjs';
import {z} from 'zod';
import {poolFor,hashToken,issueToken,cookieValue,sessionCookie,clearSessionCookie,asyncRoute,apiError,internalOnly} from '../shared/infra.mjs';

const db=poolFor('usuarios');
const app=express();app.disable('x-powered-by');app.use(express.json({limit:'16kb'}));
const loginSchema=z.object({nombre_usuario:z.string().trim().min(1).max(50),contrasena:z.string().min(1)});
const userSchema=z.object({nombre_usuario:z.string().trim().min(1).max(50),contrasena:z.string().min(8).max(128),rol:z.enum(['administrador','mesero','cocinero'])}).strict();
const patchSchema=z.object({nombre_usuario:z.string().trim().min(1).max(50).optional(),rol:z.enum(['administrador','mesero','cocinero']).optional()}).strict().refine(x=>Object.keys(x).length>0);
const publicUser=r=>({id_usuario:r.id_usuario,nombre_usuario:r.nombre_usuario,rol:r.rol,activo:!!r.activo});
async function findSession(token) {
  if (!token) return null;
  const [rows]=await db.execute('SELECT id_usuario,nombre_usuario,rol,activo FROM usuarios WHERE sesion_token_hash=? AND sesion_expira_en>NOW() AND activo=1 LIMIT 1',[hashToken(token)]);
  return rows[0]?publicUser(rows[0]):null;
}
const guard=(...roles)=>asyncRoute(async(req,res,next)=>{
 const actor=await findSession(cookieValue(req));
 if(!actor)return res.status(401).json({error:'Sesión no válida'});
 if(!roles.includes(actor.rol))return res.status(403).json({error:'Permiso denegado'});
 req.actor=actor;next();
});
app.get('/health',asyncRoute(async(_req,res)=>{await db.query('SELECT 1');res.json({service:'ms-usuarios',status:'ok'});}));
app.post('/internal/auth/verify',internalOnly,asyncRoute(async(req,res)=>{
 const actor=await findSession(z.object({token:z.string().min(1)}).parse(req.body).token);
 if(!actor)return res.status(401).json({error:'Sesión inválida'});
 res.json({user:actor});
}));
app.post('/api/auth/login',asyncRoute(async(req,res)=>{
 const {nombre_usuario,contrasena}=loginSchema.parse(req.body);
 const [rows]=await db.execute('SELECT * FROM usuarios WHERE nombre_usuario=? LIMIT 1',[nombre_usuario]);
 const record=rows[0];
 const verified=record && record.activo && await bcrypt.compare(contrasena,record.contrasena_hash);
 if(!verified) return res.status(401).json({error:'Usuario o contraseña incorrectos'});
 const hours=Number(process.env.SESSION_HOURS)||8;
 const token=issueToken();
 await db.execute('UPDATE usuarios SET sesion_token_hash=?, sesion_expira_en=DATE_ADD(NOW(),INTERVAL ? SECOND) WHERE id_usuario=?',[hashToken(token),Math.floor(hours*3600),record.id_usuario]);
 res.setHeader('Set-Cookie',sessionCookie(token,hours));
 res.json({usuario:publicUser(record)});
}));
app.get('/api/auth/me',asyncRoute(async(req,res)=>{
 const actor=await findSession(cookieValue(req));
 if(!actor)return res.status(401).json({error:'Sesión no válida'});
 res.json({usuario:actor});
}));
app.post('/api/auth/logout',asyncRoute(async(req,res)=>{
 const token=cookieValue(req);
 if(token)await db.execute('UPDATE usuarios SET sesion_token_hash=NULL,sesion_expira_en=NULL WHERE sesion_token_hash=?',[hashToken(token)]);
 res.setHeader('Set-Cookie',clearSessionCookie());res.json({ok:true});
}));
app.get('/api/usuarios',guard('administrador'),asyncRoute(async(_req,res)=>{
 const [rows]=await db.query('SELECT id_usuario,nombre_usuario,rol,activo FROM usuarios ORDER BY id_usuario');
 res.json({usuarios:rows.map(publicUser)});
}));
app.post('/api/usuarios',guard('administrador'),asyncRoute(async(req,res)=>{
 const input=userSchema.parse(req.body);
 const hash=await bcrypt.hash(input.contrasena,12);
 const [r]=await db.execute('INSERT INTO usuarios (nombre_usuario,contrasena_hash,rol,activo) VALUES(?,?,?,1)',[input.nombre_usuario,hash,input.rol]);
 res.status(201).json({usuario:{id_usuario:r.insertId,nombre_usuario:input.nombre_usuario,rol:input.rol,activo:true}});
}));
app.patch('/api/usuarios/:id',guard('administrador'),asyncRoute(async(req,res)=>{
 const id=z.coerce.number().int().positive().parse(req.params.id);
 const input=patchSchema.parse(req.body);
 const conn=await db.getConnection();
 try {
  await conn.beginTransaction();
  const [[target]]=await conn.execute('SELECT id_usuario,rol FROM usuarios WHERE id_usuario=? FOR UPDATE',[id]);
  if(!target){await conn.rollback();return res.status(404).json({error:'Usuario no encontrado'});}
  if(target.rol==='administrador'&&input.rol&&input.rol!=='administrador'){
   const [[count]]=await conn.query('SELECT COUNT(*) AS n FROM usuarios WHERE rol="administrador" AND activo=1');
   if(count.n<=1){await conn.rollback();return res.status(409).json({error:'Debe permanecer un administrador activo'});}
  }
  const cols=[];const params=[];
  if(input.nombre_usuario!==undefined){cols.push('nombre_usuario=?');params.push(input.nombre_usuario);}
  if(input.rol!==undefined){cols.push('rol=?');params.push(input.rol);cols.push('sesion_token_hash=NULL','sesion_expira_en=NULL');}
  params.push(id);
  await conn.execute(`UPDATE usuarios SET ${cols.join(',')} WHERE id_usuario=?`,params);await conn.commit();
  res.json({ok:true});
 } catch(e){await conn.rollback();throw e;} finally {conn.release();}
}));
app.patch('/api/usuarios/:id/desactivar',guard('administrador'),asyncRoute(async(req,res)=>{
 const id=z.coerce.number().int().positive().parse(req.params.id);
 const conn=await db.getConnection();
 try{
  await conn.beginTransaction();
  const [[target]]=await conn.execute('SELECT id_usuario,rol,activo FROM usuarios WHERE id_usuario=? FOR UPDATE',[id]);
  if(!target){await conn.rollback();return res.status(404).json({error:'Usuario no encontrado'});}
  if(target.rol==='administrador'&&target.activo){
   const [[count]]=await conn.query('SELECT COUNT(*) n FROM usuarios WHERE rol="administrador" AND activo=1');
   if(count.n<=1){await conn.rollback();return res.status(409).json({error:'Debe permanecer un administrador activo'});}
  }
  await conn.execute('UPDATE usuarios SET activo=0,sesion_token_hash=NULL,sesion_expira_en=NULL WHERE id_usuario=?',[id]);await conn.commit();res.json({ok:true});
 }catch(e){await conn.rollback();throw e;}finally{conn.release();}
}));
app.use(apiError);
const PORT=Number(process.env.USERS_PORT)||4001;
app.listen(PORT,process.env.HOST||'127.0.0.1',()=>console.log(`ms-usuarios :${PORT}`));
