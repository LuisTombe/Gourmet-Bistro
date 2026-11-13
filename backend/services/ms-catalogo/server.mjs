import 'dotenv/config';
import express from 'express';
import {z} from 'zod';
import {poolFor,requireRole,internalOnly,internalFetch,asyncRoute,apiError,namedLocks,baseUrl} from '../shared/infra.mjs';
const db=poolFor('catalogo');
const app=express();app.disable('x-powered-by');app.use(express.json({limit:'16kb'}));
const products=z.object({nombre:z.string().trim().min(1).max(100),descripcion:z.string().max(255).nullable().optional(),precio:z.number().finite().positive().multipleOf(0.01)}).strict();
const table=z.object({numero_mesa:z.number().int().positive()}).strict();
const id=req=>z.coerce.number().int().positive().parse(req.params.id);
const repoProduct=r=>({...r,precio:Number(r.precio),disponible:!!r.disponible});
const ordersUrl=()=>baseUrl('ORDERS_URL','http://127.0.0.1:4003');
const withResource=(key,fn)=>async()=>{
 const conn=await db.getConnection();
 try{return await namedLocks(conn,[key],()=>fn(conn));}finally{conn.release();}
};
app.get('/health',asyncRoute(async(_req,res)=>{await db.query('SELECT 1');res.json({service:'ms-catalogo',status:'ok'});}));
app.post('/internal/catalog/snapshot',internalOnly,asyncRoute(async(req,res)=>{
 const input=z.object({id_mesa:z.number().int().positive(),ids:z.array(z.number().int().positive()).min(1).max(50)}).parse(req.body);
 const [[mesa]]=await db.execute('SELECT id_mesa,numero_mesa FROM mesas WHERE id_mesa=?',[input.id_mesa]);
 if(!mesa)return res.status(422).json({error:'La mesa no existe'});
 const unique=[...new Set(input.ids)];
 const placeholders=unique.map(()=>'?').join(',');
 const [rows]=await db.query(`SELECT id_producto,nombre,precio,disponible FROM productos WHERE id_producto IN (${placeholders})`,unique);
 if(rows.length!==unique.length||rows.some(r=>!r.disponible))return res.status(422).json({error:'Producto inexistente o no disponible'});
 res.json({mesa,productos:rows.map(repoProduct)});
}));
app.get('/api/productos',requireRole('administrador','mesero','cocinero'),asyncRoute(async(_req,res)=>{
 const [rows]=await db.query('SELECT * FROM productos ORDER BY id_producto');res.json({productos:rows.map(repoProduct)});
}));
app.post('/api/productos',requireRole('administrador'),asyncRoute(async(req,res)=>{
 const input=products.parse(req.body);
 const [r]=await db.execute('INSERT INTO productos(nombre,descripcion,precio,disponible) VALUES(?,?,?,1)',[input.nombre,input.descripcion||null,input.precio]);
 res.status(201).json({producto:{id_producto:r.insertId,...input,disponible:true}});
}));
app.put('/api/productos/:id',requireRole('administrador'),asyncRoute(async(req,res)=>{
 const pid=id(req);const input=products.parse(req.body);
 await withResource(`gb:product:${pid}`,async(conn)=>{
  const [r]=await conn.execute('UPDATE productos SET nombre=?,descripcion=?,precio=? WHERE id_producto=?',[input.nombre,input.descripcion||null,input.precio,pid]);
  if(!r.affectedRows)throw Object.assign(new Error('Producto no encontrado'),{status:404});
 })();res.json({ok:true});
}));
app.patch('/api/productos/:id/disponibilidad',requireRole('administrador'),asyncRoute(async(req,res)=>{
 const pid=id(req);const input=z.object({disponible:z.boolean()}).strict().parse(req.body);
 await withResource(`gb:product:${pid}`,async(conn)=>{
  const [r]=await conn.execute('UPDATE productos SET disponible=? WHERE id_producto=?',[input.disponible,pid]);
  if(!r.affectedRows)throw Object.assign(new Error('Producto no encontrado'),{status:404});
 })();res.json({ok:true});
}));
app.delete('/api/productos/:id',requireRole('administrador'),asyncRoute(async(req,res)=>{
 const pid=id(req);
 await withResource(`gb:product:${pid}`,async(conn)=>{
  const check=await internalFetch(`${ordersUrl()}/internal/pedidos/product/${pid}/has-history`);
  if(check.hasHistory)throw Object.assign(new Error('Producto con historial: no puede eliminarse'),{status:409});
  const [r]=await conn.execute('DELETE FROM productos WHERE id_producto=?',[pid]);
  if(!r.affectedRows)throw Object.assign(new Error('Producto no encontrado'),{status:404});
 })();res.json({ok:true});
}));
app.get('/api/mesas',requireRole('administrador','mesero'),asyncRoute(async(_req,res)=>{
 const [rows]=await db.query('SELECT * FROM mesas ORDER BY numero_mesa');
 const {activeIds}=await internalFetch(`${ordersUrl()}/internal/pedidos/active-table-ids`);
 const occupied=new Set(activeIds);
 res.json({mesas:rows.map(r=>({...r,estado:occupied.has(r.id_mesa)?'Ocupada':'Disponible'}))});
}));
app.post('/api/mesas',requireRole('administrador'),asyncRoute(async(req,res)=>{
 const input=table.parse(req.body);const [r]=await db.execute('INSERT INTO mesas(numero_mesa) VALUES(?)',[input.numero_mesa]);
 res.status(201).json({mesa:{id_mesa:r.insertId,numero_mesa:input.numero_mesa}});
}));
app.put('/api/mesas/:id',requireRole('administrador'),asyncRoute(async(req,res)=>{
 const mid=id(req);const input=table.parse(req.body);
 await withResource(`gb:table:${mid}`,async(conn)=>{
  const [r]=await conn.execute('UPDATE mesas SET numero_mesa=? WHERE id_mesa=?',[input.numero_mesa,mid]);
  if(!r.affectedRows)throw Object.assign(new Error('Mesa no encontrada'),{status:404});
 })();res.json({ok:true});
}));
app.delete('/api/mesas/:id',requireRole('administrador'),asyncRoute(async(req,res)=>{
 const mid=id(req);
 await withResource(`gb:table:${mid}`,async(conn)=>{
  const check=await internalFetch(`${ordersUrl()}/internal/pedidos/table/${mid}/has-history`);
  if(check.hasHistory)throw Object.assign(new Error('Mesa con historial: no puede eliminarse'),{status:409});
  const [r]=await conn.execute('DELETE FROM mesas WHERE id_mesa=?',[mid]);
  if(!r.affectedRows)throw Object.assign(new Error('Mesa no encontrada'),{status:404});
 })();res.json({ok:true});
}));
app.use(apiError);
const PORT=Number(process.env.CATALOG_PORT)||4002;
app.listen(PORT,process.env.HOST||'127.0.0.1',()=>console.log(`ms-catalogo :${PORT}`));
