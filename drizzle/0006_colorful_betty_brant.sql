CREATE TABLE `comentarios_planes` (
	`id` int AUTO_INCREMENT NOT NULL,
	`planAccionId` int NOT NULL,
	`autor` varchar(255) NOT NULL,
	`contenido` text NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `comentarios_planes_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `planes_accion` (
	`id` int AUTO_INCREMENT NOT NULL,
	`planSuccesionId` int NOT NULL,
	`titulo` varchar(255) NOT NULL,
	`descripcion` text NOT NULL,
	`responsable` varchar(255) NOT NULL,
	`fechaInicio` timestamp NOT NULL,
	`fechaFin` timestamp NOT NULL,
	`estado` enum('No Iniciado','En Progreso','Completado','Retrasado') NOT NULL DEFAULT 'No Iniciado',
	`progreso` int NOT NULL DEFAULT 0,
	`usuario` varchar(100) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `planes_accion_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `planes_sucesion` (
	`id` int AUTO_INCREMENT NOT NULL,
	`planSustitucionId` int NOT NULL,
	`departamento` varchar(150) NOT NULL,
	`cargo` varchar(200) NOT NULL,
	`colaborador` varchar(255) NOT NULL,
	`riesgoContinuidad` enum('Alto','Medio','Bajo') NOT NULL,
	`riesgoCritico` enum('Si','No') NOT NULL DEFAULT 'No',
	`prioridadSucesion` enum('Alta','Media','Baja') NOT NULL,
	`estado` enum('Pendiente','En Progreso','Completado') NOT NULL DEFAULT 'Pendiente',
	`usuario` varchar(100) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `planes_sucesion_id` PRIMARY KEY(`id`)
);
