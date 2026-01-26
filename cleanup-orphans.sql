-- Limpiar registros en planesSuccesion que NO corresponden a puestos clave
DELETE FROM planes_sucesion 
WHERE plan_sustitucion_id IN (
  SELECT ps.id FROM planes_sustitucion ps 
  WHERE ps.puesto_clave != 'Si'
);

-- Verificar cuántos registros quedaron
SELECT COUNT(*) as total_planes_sucesion FROM planes_sucesion;
SELECT COUNT(*) as total_puestos_clave FROM planes_sustitucion WHERE puesto_clave = 'Si';
