import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

// Obtener datos de ambas tablas
const [planesSuccesion] = await connection.execute(
  'SELECT id, planSustitucionId, departamento, cargo, colaborador, reemplazo, riesgoContinuidad, riesgoCritico FROM planes_sucesion ORDER BY id'
);

const [sucesionPuestos] = await connection.execute(
  'SELECT id, planSustitucionId, puestoClave, departamentoPuestoClave, cargoPuestoClave, sucesor, aplicaSucesion FROM sucesion_puestos ORDER BY id'
);

console.log('=== ANÁLISIS DE INCOHERENCIA ===\n');
console.log(`planes_sucesion: ${planesSuccesion.length} registros`);
console.log(`sucesion_puestos: ${sucesionPuestos.length} registros\n`);

console.log('--- PLANES_SUCESION (7 registros) ---');
planesSuccesion.forEach((p, i) => {
  console.log(`${i+1}. ${p.colaborador} (${p.departamento}) - Reemplazo: ${p.reemplazo || 'VACÍO'}`);
});

console.log('\n--- SUCESION_PUESTOS (11 registros) ---');
sucesionPuestos.forEach((p, i) => {
  console.log(`${i+1}. ${p.puestoClave} (${p.departamentoPuestoClave}) - Sucesor: ${p.sucesor || 'VACÍO'}`);
});

// Identificar duplicados
console.log('\n=== ANÁLISIS DE DUPLICADOS ===');
const duplicados = sucesionPuestos.filter(sp => 
  planesSuccesion.some(ps => 
    ps.colaborador.toLowerCase() === sp.puestoClave.toLowerCase() &&
    ps.departamento === sp.departamentoPuestoClave
  )
);

console.log(`Registros que existen en ambas tablas: ${duplicados.length}`);
duplicados.forEach(d => {
  console.log(`- ${d.puestoClave} (${d.departamentoPuestoClave})`);
});

// Registros únicos en sucesion_puestos
const unicos = sucesionPuestos.filter(sp => 
  !planesSuccesion.some(ps => 
    ps.colaborador.toLowerCase() === sp.puestoClave.toLowerCase() &&
    ps.departamento === sp.departamentoPuestoClave
  )
);

console.log(`\nRegistros ÚNICOS en sucesion_puestos: ${unicos.length}`);
unicos.forEach(u => {
  console.log(`- ${u.puestoClave} (${u.departamentoPuestoClave})`);
});

console.log('\n=== RECOMENDACIÓN ===');
console.log('La tabla sucesion_puestos tiene 4 registros adicionales que no están en planes_sucesion.');
console.log('Estos podrían ser:');
console.log('1. Registros nuevos/válidos que deben mantenerse');
console.log('2. Registros duplicados/errados que deben eliminarse');
console.log('\nAcción recomendada: Consolidar en sucesion_puestos como fuente única de verdad');

await connection.end();
