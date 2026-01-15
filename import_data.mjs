import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { drizzle } from 'drizzle-orm/mysql2/promise';
import mysql from 'mysql2/promise';
import { colaboradores } from './drizzle/schema.ts';
import { eq } from 'drizzle-orm';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Leer datos del JSON
const dataPath = path.join(__dirname, 'data_to_import.json');
const rawData = fs.readFileSync(dataPath, 'utf-8');
const data = JSON.parse(rawData);

console.log('🔄 Iniciando importación de nómina...');
console.log(`📊 Total de registros a importar: ${data.length}`);

// Crear conexión a la base de datos
const connection = await mysql.createConnection({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'plan_sustitucion',
});

const db = drizzle(connection);

let importados = 0;
let duplicados = 0;
let errores = 0;

try {
  for (const row of data) {
    try {
      const cedula = String(row['C.I.'] || '').trim();
      const nombre = String(row['Nombre'] || '').trim();
      const cargo = String(row['Cargo'] || '').trim();
      const departamento = String(row['Departamento'] || '').trim();
      const area = String(row['Area'] || '').trim();
      const sede = String(row['Sede'] || '').trim();

      if (!cedula || !nombre) {
        console.warn(`⚠️  Fila incompleta: ${nombre || cedula}`);
        errores++;
        continue;
      }

      // Verificar si ya existe
      const existing = await db
        .select()
        .from(colaboradores)
        .where(eq(colaboradores.cedula, cedula))
        .limit(1);

      if (existing.length > 0) {
        duplicados++;
        continue;
      }

      // Insertar nuevo colaborador
      await db.insert(colaboradores).values({
        cedula,
        nombre,
        cargo,
        departamento,
        area,
        sede,
      });

      importados++;

      if (importados % 50 === 0) {
        console.log(`✅ ${importados} colaboradores importados...`);
      }
    } catch (error) {
      console.error(`❌ Error en fila: ${error.message}`);
      errores++;
    }
  }

  console.log('\n' + '='.repeat(60));
  console.log('📋 RESUMEN DE IMPORTACIÓN:');
  console.log('='.repeat(60));
  console.log(`✅ Importados: ${importados}`);
  console.log(`⚠️  Duplicados: ${duplicados}`);
  console.log(`❌ Errores: ${errores}`);
  console.log('='.repeat(60));
} catch (error) {
  console.error('Error:', error);
} finally {
  await connection.end();
}
