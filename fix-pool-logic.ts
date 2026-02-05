// Nueva lógica para crear plan con múltiples reemplazos del pool
if (input.tipoReemplazo === "pool") {
  const colaboradoresPool = await getEmpleadosByCargoAndDepartamento(
    input.cargoPoolReemplazo!,
    input.departamentoPoolReemplazo!
  );
  
  // Filtrar: excluir al colaborador seleccionado y tomar máximo 2 reemplazos
  const reemplazosDelPool = colaboradoresPool
    .filter(c => c.nombre !== input.colaborador)
    .slice(0, 2)
    .map(c => ({
      nombre: c.nombre,
      cargo: c.cargo,
      departamento: c.departamento,
    }));

  if (reemplazosDelPool.length === 0) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "No hay reemplazos disponibles en el pool (excluyendo al colaborador seleccionado)",
    });
  }

  try {
    // Crear plan con múltiples reemplazos
    const planCreado = await createPlanWithReemplazos(
      {
        empleadoId: input.empleadoId,
        departamento: input.departamento,
        colaborador: input.colaborador,
        cargo: input.cargo,
        departamentoReemplazo: input.departamentoPoolReemplazo!,
        reemplazo: reemplazosDelPool[0].nombre, // Primer reemplazo en campo principal
        cargoReemplazo: input.cargoPoolReemplazo!,
        tipoReemplazo: "pool",
        puestoClave: input.puestoClave,
        usuario: ctx.user?.name || "usuario",
      },
      reemplazosDelPool
    );

    return { 
      success: true, 
      plan: planCreado.plan,
      reemplazos: planCreado.reemplazos,
      totalReemplazos: planCreado.reemplazos.length,
    };
  } catch (error: any) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: error?.message || "Error creando plan con reemplazos del pool",
    });
  }
} else {
