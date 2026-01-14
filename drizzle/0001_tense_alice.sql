CREATE TABLE `empleados` (
	`id` int AUTO_INCREMENT NOT NULL,
	`sede` varchar(100) NOT NULL,
	`cedula` varchar(20) NOT NULL,
	`nombre` varchar(255) NOT NULL,
	`area` varchar(150) NOT NULL,
	`departamento` varchar(150) NOT NULL,
	`cargo` varchar(200) NOT NULL,
	CONSTRAINT `empleados_id` PRIMARY KEY(`id`),
	CONSTRAINT `empleados_cedula_unique` UNIQUE(`cedula`)
);
--> statement-breakpoint
CREATE TABLE `planes_sustitucion` (
	`id` int AUTO_INCREMENT NOT NULL,
	`empleadoId` int NOT NULL,
	`departamento` varchar(150) NOT NULL,
	`colaborador` varchar(255) NOT NULL,
	`cargo` varchar(200) NOT NULL,
	`departamentoReemplazo` varchar(150) NOT NULL,
	`reemplazo` varchar(255) NOT NULL,
	`cargoReemplazo` varchar(200) NOT NULL,
	`puestoClave` enum('Si','No') NOT NULL DEFAULT 'No',
	`usuario` varchar(100) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `planes_sustitucion_id` PRIMARY KEY(`id`)
);
