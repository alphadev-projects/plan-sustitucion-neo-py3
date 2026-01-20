ALTER TABLE `planes_sustitucion` ADD `cargoUnico` enum('Si','No') DEFAULT 'No' NOT NULL;--> statement-breakpoint
ALTER TABLE `planes_sustitucion` ADD `cantidadPersonasMismoCargo` int DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE `planes_sustitucion` ADD `riesgoContinuidad` enum('Alto','Medio','Bajo') DEFAULT 'Bajo' NOT NULL;--> statement-breakpoint
ALTER TABLE `planes_sustitucion` ADD `poolPotencial` enum('Si','No') DEFAULT 'No' NOT NULL;--> statement-breakpoint
ALTER TABLE `planes_sustitucion` ADD `riesgoCritico` enum('Si','No') DEFAULT 'No' NOT NULL;--> statement-breakpoint
ALTER TABLE `planes_sustitucion` ADD `prioridadSucesion` enum('Alta','Media','Baja') DEFAULT 'Baja' NOT NULL;