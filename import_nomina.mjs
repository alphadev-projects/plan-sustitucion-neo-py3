import openpyxl from 'openpyxl';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  connectionLimit: 10,
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  enableKeepAlive: true,
  keepAliveInitialDelayMs: 0,
});

async function importNomina() {
  const connection = await pool.getConnection();
  
  try {
    console.log('🔄 Iniciando importación de nómina...');
    
    // Leer archivo Excel
    const XLSX = await import('xlsx');
    const workbook = XLSX.readFile('/home/ubuntu/upload/NOMINA-PLAN.xlsx');
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(sheet);
    
    console.log(`📊 Total de registros encontrados: ${data.length}`);
    
    let importados = 0;
    let duplicados = 0;
    let errores = 0;
    
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
        const [existing] = await connection.query(
          'SELECT id FROM colaboradores WHERE cedula = ?',
          [cedula]
        );
        
        if (existing.length > 0) {
          duplicados++;
          continue;
        }
        
        // Insertar nuevo colaborador
        await connection.query(
          'INSERT INTO colaboradores (cedula, nombre, cargo, departamento, area, sede) VALUES (?, ?, ?, ?, ?, ?)',
          [cedula, nombre, cargo, departamento, area, sede]
        );
        
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
    await connection.release();
    await pool.end();
  }
}

importNomina();
