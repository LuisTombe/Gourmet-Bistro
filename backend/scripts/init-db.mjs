import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import dotenv from 'dotenv';
import mysql from 'mysql2/promise';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, '..');
dotenv.config({path: path.join(backendRoot, '.env')});

const host = process.env.MYSQL_HOST || '127.0.0.1';
const port = Number(process.env.MYSQL_PORT || 3306);
const rootPassword = process.env.MYSQL_ROOT_PASSWORD ?? '';

const conn = await mysql.createConnection({host, port, user: 'root', password: rootPassword, multipleStatements: true});
try {
  const sqlFiles = fs.readdirSync(path.join(backendRoot, 'sql'))
    .filter((f) => f.endsWith('.sql') && !f.startsWith('000_'))
    .sort();

  for (const file of sqlFiles) {
    const sql = fs.readFileSync(path.join(backendRoot, 'sql', file), 'utf8');
    await conn.query(sql);
    console.log(`Aplicado: sql/${file}`);
  }

  const grants = [
    ['gb_usuarios', process.env.MYSQL_USERS_PASSWORD, 'restaurante_usuarios'],
    ['gb_catalogo', process.env.MYSQL_CATALOG_PASSWORD, 'restaurante_catalogo'],
    ['gb_pedidos', process.env.MYSQL_ORDERS_PASSWORD, 'restaurante_pedidos'],
  ];

  for (const [user, pass, dbName] of grants) {
    if (!pass || pass.includes('REEMPLAZAR')) throw new Error(`Falta contraseña para ${user} en backend/.env`);
    for (const hostScope of ['127.0.0.1', 'localhost']) {
      await conn.query('CREATE USER IF NOT EXISTS ?@? IDENTIFIED BY ?', [user, hostScope, pass]);
      await conn.query('ALTER USER ?@? IDENTIFIED BY ?', [user, hostScope, pass]);
      await conn.query(`REVOKE ALL PRIVILEGES ON \`${dbName}\`.* FROM '${user}'@'${hostScope}'`).catch(() => {});
      await conn.query(`GRANT SELECT, INSERT, UPDATE, DELETE ON \`${dbName}\`.* TO '${user}'@'${hostScope}'`);
      if (user === 'gb_usuarios') {
        await conn.query(`GRANT CREATE, ALTER, DROP, INDEX ON \`restaurante_usuarios\`.* TO '${user}'@'${hostScope}'`);
      }
    }
    console.log(`Usuario mínimo privilegio listo: ${user} -> ${dbName}.*`);
  }
  await conn.query('FLUSH PRIVILEGES');
  console.log(`Base de datos XAMPP (${host}:${port}) inicializada.`);
} finally {
  await conn.end();
}
