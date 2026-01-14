CREATE TABLE `usuarios_locales` (
	`id` int AUTO_INCREMENT NOT NULL,
	`usuario` varchar(100) NOT NULL,
	`contraseña` varchar(255) NOT NULL,
	`nombre` varchar(255) NOT NULL,
	`email` varchar(320),
	`role` enum('standard','admin') NOT NULL DEFAULT 'standard',
	`activo` int NOT NULL DEFAULT 1,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `usuarios_locales_id` PRIMARY KEY(`id`),
	CONSTRAINT `usuarios_locales_usuario_unique` UNIQUE(`usuario`)
);
