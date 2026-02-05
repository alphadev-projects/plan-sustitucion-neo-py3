CREATE TABLE `plan_reemplazos` (
	`id` int AUTO_INCREMENT NOT NULL,
	`planSustitucionId` int NOT NULL,
	`reemplazo` varchar(255) NOT NULL,
	`cargoReemplazo` varchar(200) NOT NULL,
	`departamentoReemplazo` varchar(150) NOT NULL,
	`orden` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `plan_reemplazos_id` PRIMARY KEY(`id`)
);
