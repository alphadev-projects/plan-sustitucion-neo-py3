import mysql from 'mysql2/promise';

const connection = await mysql.createConnection(process.env.DATABASE_URL);

// Obtener datos de ambas tablas
const [planesSuccesion] = await connection.execute(
  'SELECT id, planSustitucionId, departamento, cargo, colaborador, reemplazo, riesgoContinuidad, riesgoCritico FROM planes_sucesion ORDER BY id'
);

const [sucesionPuestos] = await connection.execute(
  'SELECT id, planSustitucionId, puestoClave, departamentoPuestoClave, cargoPuestoClave, sucesor, aplicaSucesion FROM sucesion_puestos ORDER BY id'
);

console.log('=== DESPUÉS DE LIMPIEZA ===\n');
console.log(`planes_sucesion: ${planesSuccesion.length} registros`);
console.log(`sucesion_puestos: ${sucesionPuestos.length} registros\n`);

console.log('--- PLANES_SUCESION (7 registros) ---');
planesSuccesion.forEach((p, i) => {
  console.log(`${i+1}. ${p.colaborador} (${p.departamento}) - Reemplazo: ${p.reemplazo || 'VACÍO'}`);
});

console.log('\n--- SUCESION_PUESTOS (10 registros) ---');
sucesionPuestos.forEach((p, i) => {
  console.log(`${i+1}. ${p.puestoClave} (${p.departamentoPuestoClave}) - Sucesor: ${p.sucesor || 'VACÍO'}`);
});

// Encontrar registros en sucesion_puestos que NO están en planes_sucesion
console.log('\n=== REGISTROS EN sucesion_puestos QUE NO ESTÁN EN planes_sucesion ===');
const unicos = sucesionPuestos.filter(sp => 
  !planesSuccesion.some(ps => 
    ps.colaborador.toLowerCase() === sp.puestoClave.toLowerCase() &&
    ps.departamento === sp.departamentoPuestoClave
  )
);

console.log(`Total: ${unicos.length}`);
unicos.forEach(u => {
  console.log(`- ID: ${u.id}, ${u.puestoClave} (${u.departamentoPuestoClave}) - Sucesor: ${u.sucesor || 'VACÍO'}`);
});

console.log('\n=== ANÁLISIS ===');
console.log(`Diferencia: ${sucesionPuestos.length - planesSuccesion.length} registros`);
console.log('Estos 3 registros adicionales en sucesion_puestos son:');
unicos.forEach(u => {
  console.log(`- ${u.puestoClave}`);
});

await connection.end();
