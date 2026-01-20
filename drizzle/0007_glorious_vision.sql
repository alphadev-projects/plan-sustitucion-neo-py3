CREATE TABLE `seguimiento_planes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`planAccionId` int NOT NULL,
	`estado` enum('No Iniciado','En Progreso','Completado','Retrasado') NOT NULL DEFAULT 'No Iniciado',
	`progreso` int NOT NULL DEFAULT 0,
	`fechaInicio` timestamp,
	`fechaFin` timestamp,
	`evidencia` text,
	`archivoEvidencia` varchar(500),
	`comentario` text,
	`validadoPor` varchar(255),
	`fechaValidacion` timestamp,
	`usuario` varchar(100) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `seguimiento_planes_id` PRIMARY KEY(`id`)
);
