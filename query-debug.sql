-- Verificar cantidad de registros en sucesion_puestos
SELECT COUNT(*) as total_sucesion_puestos FROM sucesion_puestos;

-- Verificar cantidad de puestos críticos en planes_sustitucion
SELECT COUNT(*) as total_puestos_criticos FROM planes_sustitucion WHERE puestoClave = 'Si';

-- Verificar puestos críticos sin sucesor
SELECT COUNT(*) as sin_sucesor FROM sucesion_puestos WHERE sucesor = '' OR sucesor IS NULL;

-- Listar todos los puestos críticos con sus sucesores
SELECT 
  puestoClave,
  departamentoPuestoClave,
  cargoPuestoClave,
  sucesor,
  aplicaSucesion
FROM sucesion_puestos
ORDER BY sucesor DESC;

-- Verificar planes_sustitucion con puestoClave = Si
SELECT 
  colaborador,
  departamento,
  cargo,
  reemplazo,
  puestoClave
FROM planes_sustitucion 
WHERE puestoClave = 'Si'
ORDER BY colaborador;
