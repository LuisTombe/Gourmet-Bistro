import 'dotenv/config';
import bcrypt from 'bcryptjs';
import { poolFor } from '../shared/infra.mjs';

async function seedInitialData() {
  console.log('🌱 Sembrando datos iniciales del restaurante...');

  // 1. Usuarios adicionales (Mesero y Cocinero)
  const dbUsuarios = poolFor('usuarios');
  const [usersCount] = await dbUsuarios.query('SELECT COUNT(*) AS n FROM usuarios WHERE nombre_usuario IN ("carlos_m", "chef_mateo")');
  if (usersCount[0].n === 0) {
    const meseroPass = await bcrypt.hash('MeseroPass2026!', 12);
    const cocineroPass = await bcrypt.hash('CocinaPass2026!', 12);
    await dbUsuarios.execute(
      'INSERT INTO usuarios(nombre_usuario, contrasena_hash, rol, activo) VALUES (?, ?, "mesero", 1)',
      ['carlos_m', meseroPass]
    );
    await dbUsuarios.execute(
      'INSERT INTO usuarios(nombre_usuario, contrasena_hash, rol, activo) VALUES (?, ?, "cocinero", 1)',
      ['chef_mateo', cocineroPass]
    );
    console.log('✅ Usuarios mesero (carlos_m) y cocinero (chef_mateo) creados.');
  }
  await dbUsuarios.end();

  // 2. Mesas
  const dbCatalogo = poolFor('catalogo');
  const [mesasCount] = await dbCatalogo.query('SELECT COUNT(*) AS n FROM mesas');
  if (mesasCount[0].n === 0) {
    for (let i = 1; i <= 9; i++) {
      await dbCatalogo.execute('INSERT INTO mesas(numero_mesa) VALUES (?)', [i]);
    }
    console.log('✅ Mesas 1 a 9 registradas en catálogo.');
  }

  // 3. Productos del Menú
  const [prodCount] = await dbCatalogo.query('SELECT COUNT(*) AS n FROM productos');
  if (prodCount[0].n === 0) {
    const sampleProducts = [
      ['Carpaccio de Res Trufado', 'Láminas de lomo con aceite de trufa y parmesano reggiano.', 38000],
      ['Burrata Pugliese con Higos', 'Burrata fresca sobre rúcula silvestre e higos caramelizados.', 34000],
      ['Tartar de Atún Rojo & Palta', 'Atún fresco con aderezo ponzu y emulsión de aguacate.', 42000],
      ['Ojo de Bife Angosto (400g)', 'Corte madurado 28 días terminado a la leña.', 89000],
      ['Costillas de Cordero Patagónico', 'Costillas al romero y puré rústico.', 84000],
      ['Salmón Austral Glaseado', 'Filete de salmón salvaje con glaseado teriyaki.', 72000],
      ['Risotto ai Frutti di Mare', 'Arroz carnaroli con langostinos, calamares y mejillones.', 62000],
      ['Ravioli de Ossobuco Braseado', 'Pasta artesanal bañada en reducción al vino tinto.', 56000],
      ['Pappardelle al Ragu de Jabalí', 'Cintas caseras con ragú toscano cocinado 8 horas.', 54000],
      ['Tiramisú Tradizionale', 'Savoiardi con café espresso y crema mascarpone.', 24000],
      ['Esfera de Chocolate Valrhona', 'Mousse de avellana con baño de cacao amargo.', 28000],
      ['Cóctel Smoked Old Fashioned', 'Bourbon añejo con piel de naranja y humo de roble.', 36000],
      ['Gin Tonic Botánico', 'Ginebra artesanal con frutos rojos y enebro fresco.', 32000],
      ['Limonada de Hierbabuena & Jengibre', 'Extracto natural de limón y hierbabuena fresca.', 14000],
    ];

    for (const [nombre, desc, precio] of sampleProducts) {
      await dbCatalogo.execute(
        'INSERT INTO productos(nombre, descripcion, precio, disponible) VALUES (?, ?, ?, 1)',
        [nombre, desc, precio]
      );
    }
    console.log('✅ 14 productos del menú sembrados en catálogo.');
  }
  await dbCatalogo.end();

  console.log('✨ Base de datos y catálogo listos para operar.');
}

seedInitialData().catch(console.error);

