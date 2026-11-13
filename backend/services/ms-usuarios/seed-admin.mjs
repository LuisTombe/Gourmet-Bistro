import 'dotenv/config';
import bcrypt from 'bcryptjs';
import {poolFor} from '../shared/infra.mjs';
const name=process.env.ADMIN_USERNAME;
const password=process.env.ADMIN_PASSWORD;
if(!name||!password||password.length<12) { console.error('Configura ADMIN_USERNAME y ADMIN_PASSWORD de al menos 12 caracteres en .env'); process.exit(1); }
const db=poolFor('usuarios');
const [rows]=await db.query('SELECT COUNT(*) AS n FROM usuarios');
if(rows[0].n!==0){console.error('Bootstrap solo permitido con tabla usuarios vacía');await db.end();process.exit(1);}
await db.execute('INSERT INTO usuarios(nombre_usuario,contrasena_hash,rol,activo) VALUES(?,?,?,1)',[name,await bcrypt.hash(password,12),'administrador']);
console.log(`Administrador inicial creado: ${name}. Retira ADMIN_PASSWORD del entorno.`);
await db.end();
