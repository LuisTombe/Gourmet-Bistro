import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const backendRoot = path.resolve(__dirname, '..');
const envPath = path.join(backendRoot, '.env');
const secret = (bytes = 24) => crypto.randomBytes(bytes).toString('base64url');
const force = process.argv.includes('--force');

if (force || !fs.existsSync(envPath) || fs.readFileSync(envPath, 'utf8').includes('REEMPLAZAR')) {
  fs.writeFileSync(
    envPath,
    [
      '# Generado automáticamente para XAMPP (puerto 3306). Nunca subir a Git.',
      'NODE_ENV=development',
      'HOST=127.0.0.1',
      'USERS_PORT=4001',
      'CATALOG_PORT=4002',
      'ORDERS_PORT=4003',
      'USERS_URL=http://127.0.0.1:4001',
      'CATALOG_URL=http://127.0.0.1:4002',
      'ORDERS_URL=http://127.0.0.1:4003',
      `INTERNAL_SERVICE_KEY=${secret(32)}`,
      'SESSION_HOURS=8',
      'MYSQL_HOST=127.0.0.1',
      'MYSQL_PORT=3306',
      'MYSQL_USERS_USER=gb_usuarios',
      `MYSQL_USERS_PASSWORD=${secret(24)}`,
      'MYSQL_CATALOG_USER=gb_catalogo',
      `MYSQL_CATALOG_PASSWORD=${secret(24)}`,
      'MYSQL_ORDERS_USER=gb_pedidos',
      `MYSQL_ORDERS_PASSWORD=${secret(24)}`,
      'ADMIN_USERNAME=admin',
      'ADMIN_PASSWORD=AdminPass2026!',
      '',
    ].join('\n'),
    'utf8',
  );
  console.log(`Generado: ${envPath}`);
} else {
  console.log(`Omitido (ya configurado): ${envPath}`);
}
