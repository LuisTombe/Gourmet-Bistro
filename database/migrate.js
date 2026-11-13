import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  multipleStatements: true,
};

async function runMigration() {
  console.log('----------------------------------------------------');
  console.log('🔄 Iniciando migración de base de datos MySQL / XAMPP...');
  console.log(`🔌 Conectando a ${dbConfig.user}@${dbConfig.host}:${dbConfig.port}...`);

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Conexión establecida con éxito con el servidor MySQL.');

    const schemaPath = path.join(__dirname, 'schema.sql');
    if (!fs.existsSync(schemaPath)) {
      throw new Error(`No se encontró el archivo de esquema en: ${schemaPath}`);
    }

    const schemaSql = fs.readFileSync(schemaPath, 'utf8');
    console.log('📜 Ejecutando script de migración y creación de esquema...');

    await connection.query(schemaSql);
    console.log('✅ Esquema y datos semilla creados exitosamente.');

    // Verificación
    await connection.changeUser({ database: process.env.DB_NAME || 'gourmet_bistro' });
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`📊 Tablas disponibles (${tables.length}):`);
    tables.forEach((t) => {
      console.log(`   - ${Object.values(t)[0]}`);
    });

    console.log('✨ Base de datos lista para su uso en desarrollo y producción.');
    console.log('----------------------------------------------------');
  } catch (error) {
    console.error('❌ Error durante la migración de la base de datos:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

runMigration();
