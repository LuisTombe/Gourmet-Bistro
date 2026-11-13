CREATE DATABASE IF NOT EXISTS restaurante_usuarios CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE restaurante_usuarios;
CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario INT PRIMARY KEY AUTO_INCREMENT,
  nombre_usuario VARCHAR(50) NOT NULL UNIQUE,
  contrasena_hash VARCHAR(255) NOT NULL,
  rol ENUM('administrador','mesero','cocinero') NOT NULL,
  activo BOOLEAN NOT NULL DEFAULT TRUE,
  sesion_token_hash VARCHAR(255) NULL,
  sesion_expira_en DATETIME NULL
) ENGINE=InnoDB;
