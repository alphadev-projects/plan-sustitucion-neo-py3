CREATE TABLE `auditoria_planes_accion` (
	`id` int AUTO_INCREMENT NOT NULL,
	`planAccionId` int NOT NULL,
	`usuarioId` varchar(255) NOT NULL,
	`usuario` varchar(100) NOT NULL,
	`accion` enum('CREADO','ACTUALIZADO','ESTADO_CAMBIO','PROGRESO_CAMBIO','COMPLETADO') NOT NULL,
	`campoModificado` varchar(100),
	`valorAnterior` text,
	`valorNuevo` text,
	`descripcion` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditoria_planes_accion_id` PRIMARY KEY(`id`)
);
