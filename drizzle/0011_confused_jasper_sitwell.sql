ALTER TABLE `planes_sucesion` ADD `cargoUnico` tinyint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `planes_sucesion` ADD `cantidadPersonasMismoCargo` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `planes_sucesion` ADD `poolPotencial` tinyint DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `planes_sucesion` ADD `estadoPuesto` varchar(100) NOT NULL;