/**
 * Adaptador HTTP para las vistas actuales de Gourmet-Bistro.
 * Copiar a src/services/apiClient.ts y utilizarlo progresivamente desde RestaurantContext.
 * Esta API NO usa localStorage para información de negocio ni conserva credenciales en JS.
 */
export type Rol = 'administrador' | 'mesero' | 'cocinero';
export type Estado = 'Pendiente' | 'En preparación' | 'Listo' | 'Entregado';
export type Usuario = {id_usuario:number;nombre_usuario:string;rol:Rol;activo:boolean};
export type Producto = {id_producto:number;nombre:string;descripcion:string|null;precio:number;disponible:boolean};
export type Mesa = {id_mesa:number;numero_mesa:number;estado:'Disponible'|'Ocupada'};
export type DetallePedido = {id_detalle:number;id_producto:number;nombre_producto:string;cantidad:number;precio_unitario:number;subtotal:number};
export type Pedido = {id_pedido:number;id_mesa:number;id_usuario:number;fecha_pedido:string;estado:Estado;total:number;detalles:DetallePedido[]};
export class ApiError extends Error {constructor(public status:number,message:string){super(message);this.name='ApiError';}}
export async function request<T>(path:string, options:RequestInit={}):Promise<T> {
  const headers:HeadersInit={...(options.body?{'content-type':'application/json'}:{}),...(options.headers||{})};
  let response:Response;
  try { response=await fetch(path,{...options,headers,credentials:'same-origin'}); }
  catch { throw new ApiError(503,'Sin conexión con el servidor. Verifica el estado de la operación antes de reintentar.'); }
  const data=await response.json().catch(()=>({}));
  if(!response.ok)throw new ApiError(response.status,data.error||'No se pudo completar la operación');
  return data as T;
}
const json=(value:unknown)=>JSON.stringify(value);
export const api={
  auth:{
    login:(nombre_usuario:string,contrasena:string)=>request<{usuario:Usuario}>('/api/auth/login',{method:'POST',body:json({nombre_usuario,contrasena})}),
    me:()=>request<{usuario:Usuario}>('/api/auth/me'),
    logout:()=>request<{ok:boolean}>('/api/auth/logout',{method:'POST'}),
  },
  usuarios:{
    listar:()=>request<{usuarios:Usuario[]}>('/api/usuarios'),
    crear:(input:{nombre_usuario:string;contrasena:string;rol:Rol})=>request('/api/usuarios',{method:'POST',body:json(input)}),
    editar:(id:number,input:{nombre_usuario?:string;rol?:Rol})=>request(`/api/usuarios/${id}`,{method:'PATCH',body:json(input)}),
    desactivar:(id:number)=>request(`/api/usuarios/${id}/desactivar`,{method:'PATCH'}),
  },
  productos:{
    listar:()=>request<{productos:Producto[]}>('/api/productos'),
    crear:(input:{nombre:string;descripcion?:string|null;precio:number})=>request('/api/productos',{method:'POST',body:json(input)}),
    editar:(id:number,input:{nombre:string;descripcion?:string|null;precio:number})=>request(`/api/productos/${id}`,{method:'PUT',body:json(input)}),
    disponibilidad:(id:number,disponible:boolean)=>request(`/api/productos/${id}/disponibilidad`,{method:'PATCH',body:json({disponible})}),
    eliminar:(id:number)=>request(`/api/productos/${id}`,{method:'DELETE'}),
  },
  mesas:{
    listar:()=>request<{mesas:Mesa[]}>('/api/mesas'),
    crear:(numero_mesa:number)=>request('/api/mesas',{method:'POST',body:json({numero_mesa})}),
    editar:(id:number,numero_mesa:number)=>request(`/api/mesas/${id}`,{method:'PUT',body:json({numero_mesa})}),
    eliminar:(id:number)=>request(`/api/mesas/${id}`,{method:'DELETE'}),
  },
  pedidos:{
    listar:(estado?:Estado)=>request<{pedidos:Pedido[]}>(`/api/pedidos${estado?`?estado=${encodeURIComponent(estado)}`:''}`),
    detalle:(id:number)=>request<{pedido:Pedido}>(`/api/pedidos/${id}`),
    crear:(id_mesa:number,items:{id_producto:number;cantidad:number}[],total_confirmado:number)=>
      request<{pedido:{id_pedido:number;id_mesa:number;estado:Estado;total:number}}>('/api/pedidos',{method:'POST',body:json({id_mesa,items,total_confirmado})}),
    avanzar:(id:number,estado:Estado)=>request(`/api/pedidos/${id}/estado`,{method:'PATCH',body:json({estado})}),
  }
};
/**
 * AVISO: adaptar las vistas actuales antes de reemplazar RestaurantContext.
 * El contexto original utiliza métodos SINCRÓNICOS y datos simulados.
 * api.* devuelve Promises y requiere isLoading, errores y actualizaciones tras await.
 */
