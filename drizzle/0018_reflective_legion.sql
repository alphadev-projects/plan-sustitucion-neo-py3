CREATE TABLE `auditoria_planes_accion_sustitucion` (
	`id` int AUTO_INCREMENT NOT NULL,
	`planAccionSustitucionId` int NOT NULL,
	`usuarioId` varchar(255) NOT NULL,
	`usuario` varchar(100) NOT NULL,
	`accion` enum('CREADO','ACTUALIZADO','ESTADO_CAMBIO','PROGRESO_CAMBIO','COMPLETADO') NOT NULL,
	`campoModificado` varchar(100),
	`valorAnterior` text,
	`valorNuevo` text,
	`descripcion` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `auditoria_planes_accion_sustitucion_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `planes_accion_sustitucion` (
	`id` int AUTO_INCREMENT NOT NULL,
	`planSustitucionId` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descripcion` text NOT NULL,
	`responsable` varchar(255) NOT NULL,
	`fechaInicio` timestamp NOT NULL,
	`fechaFin` timestamp NOT NULL,
	`estado` enum('No Iniciado','En Progreso','Completado','Retrasado') NOT NULL DEFAULT 'No Iniciado',
	`progreso` int NOT NULL DEFAULT 0,
	`evidencia` text,
	`archivoEvidencia` varchar(500),
	`comentarios` text,
	`usuario` varchar(100) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `planes_accion_sustitucion_id` PRIMARY KEY(`id`)
);
