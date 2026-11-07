-- Flyway migration V1: the tasks table.
-- Flyway runs this automatically when the application starts (schema history
-- is kept in the flyway_schema_history table inside the same database).

CREATE TABLE tasks (
    id          BIGINT       NOT NULL AUTO_INCREMENT,
    title       VARCHAR(200) NOT NULL,
    description VARCHAR(1000) NULL,
    status      VARCHAR(20)  NOT NULL DEFAULT 'TODO',
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE = InnoDB
  DEFAULT CHARSET = utf8mb4
  COLLATE = utf8mb4_unicode_ci;
