USE restaurante_usuarios;

CREATE TABLE IF NOT EXISTS system_snapshots (
  id_snapshot VARCHAR(64) PRIMARY KEY,
  version_tag VARCHAR(64) NOT NULL,
  branch VARCHAR(64) NOT NULL,
  commit_hash VARCHAR(64) NOT NULL,
  autor_id INT NOT NULL,
  autor_nombre VARCHAR(50) NOT NULL,
  autor_rol VARCHAR(30) NOT NULL,
  descripcion VARCHAR(255) NOT NULL,
  tipo ENUM('git_release','audit_snapshot','recovery_point') NOT NULL DEFAULT 'recovery_point',
  estado_json LONGTEXT NOT NULL,
  creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  INDEX ix_snapshots_creado (creado_en DESC)
) ENGINE=InnoDB;
