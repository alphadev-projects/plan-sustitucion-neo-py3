CREATE TABLE `historial_sucesores` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sucesionPuestoId` int NOT NULL,
	`sucesorAnterior` varchar(255) NOT NULL DEFAULT '',
	`sucesorNuevo` varchar(255) NOT NULL DEFAULT '',
	`motivo` text,
	`usuario` varchar(100) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `historial_sucesores_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sucesion_puestos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`planSustitucionId` int NOT NULL,
	`puestoClave` varchar(255) NOT NULL,
	`departamentoPuestoClave` varchar(150) NOT NULL,
	`cargoPuestoClave` varchar(200) NOT NULL,
	`sucesor` varchar(255) NOT NULL DEFAULT '',
	`departamentoSucesor` varchar(150) NOT NULL DEFAULT '',
	`cargoSucesor` varchar(200) NOT NULL DEFAULT '',
	`aplicaSucesion` enum('Si','No') NOT NULL DEFAULT 'No',
	`usuario` varchar(100) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `sucesion_puestos_id` PRIMARY KEY(`id`)
);
