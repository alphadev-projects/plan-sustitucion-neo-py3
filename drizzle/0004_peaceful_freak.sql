ALTER TABLE `planes_sustitucion` ADD `tipoReemplazo` enum('individual','pool') DEFAULT 'individual' NOT NULL;--> statement-breakpoint
ALTER TABLE `planes_sustitucion` ADD `cargoPoolReemplazo` varchar(200);--> statement-breakpoint
ALTER TABLE `planes_sustitucion` ADD `departamentoPoolReemplazo` varchar(150);