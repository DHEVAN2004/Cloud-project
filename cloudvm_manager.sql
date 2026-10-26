-- CloudVM Manager starter schema/data for MySQL 8.0.16+
-- No account rows/passwords are seeded. Users register through POST /api/auth/register.
CREATE DATABASE IF NOT EXISTS cloudvm_manager
  CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci;
USE cloudvm_manager;

CREATE TABLE IF NOT EXISTS users (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  username VARCHAR(80) NOT NULL,
  email VARCHAR(254) NOT NULL,
  password_hash VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'USER',
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT uk_users_username UNIQUE (username),
  CONSTRAINT uk_users_email UNIQUE (email),
  CONSTRAINT chk_users_role CHECK (role IN ('USER', 'ADMIN'))
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS virtual_machines (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description VARCHAR(500),
  os VARCHAR(80) NOT NULL,
  cpu_cores INT NOT NULL,
  memory_gb DOUBLE NOT NULL,
  storage_gb DOUBLE NOT NULL,
  status VARCHAR(20) NOT NULL,
  network_config VARCHAR(80) NOT NULL,
  ip_address VARCHAR(45),
  mac_address VARCHAR(17),
  cpu_usage INT NOT NULL DEFAULT 0,
  memory_usage INT NOT NULL DEFAULT 0,
  storage_usage INT NOT NULL DEFAULT 0,
  network_usage INT NOT NULL DEFAULT 0,
  template VARCHAR(100),
  port_forwarding BOOLEAN NOT NULL DEFAULT FALSE,
  start_on_boot BOOLEAN NOT NULL DEFAULT FALSE,
  ssh_key VARCHAR(120),
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  owner_id VARCHAR(36),
  CONSTRAINT fk_vm_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT uk_vm_mac UNIQUE (mac_address),
  CONSTRAINT chk_vm_cpu CHECK (cpu_cores BETWEEN 1 AND 128),
  CONSTRAINT chk_vm_memory CHECK (memory_gb > 0),
  CONSTRAINT chk_vm_storage CHECK (storage_gb > 0),
  CONSTRAINT chk_vm_status CHECK (status IN ('Running', 'Stopped', 'Error')),
  CONSTRAINT chk_vm_usage CHECK (
    cpu_usage BETWEEN 0 AND 100 AND memory_usage BETWEEN 0 AND 100
    AND storage_usage BETWEEN 0 AND 100 AND network_usage BETWEEN 0 AND 100
  ),
  INDEX idx_vm_owner_status (owner_id, status),
  INDEX idx_vm_created_at (created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS networks (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  network_name VARCHAR(100) NOT NULL,
  network_type VARCHAR(20) NOT NULL,
  subnet VARCHAR(43) NOT NULL,
  gateway VARCHAR(45),
  description VARCHAR(500),
  status VARCHAR(20) NOT NULL DEFAULT 'Active',
  owner_id VARCHAR(36),
  CONSTRAINT fk_network_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_network_mode CHECK (network_type IN ('NAT', 'Bridged', 'Host-only')),
  CONSTRAINT chk_network_status CHECK (status IN ('Active', 'Inactive')),
  INDEX idx_network_owner (owner_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS vm_networks (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  vm_id VARCHAR(36) NOT NULL,
  network_id VARCHAR(36) NOT NULL,
  CONSTRAINT fk_vm_network_vm FOREIGN KEY (vm_id) REFERENCES virtual_machines(id) ON DELETE CASCADE,
  CONSTRAINT fk_vm_network_network FOREIGN KEY (network_id) REFERENCES networks(id) ON DELETE CASCADE,
  CONSTRAINT uk_vm_network_pair UNIQUE (vm_id, network_id),
  INDEX idx_vm_network_network (network_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS vm_resources (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  vm_id VARCHAR(36) NOT NULL,
  recorded_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  cpu_usage_percent INT NOT NULL,
  memory_usage_percent INT NOT NULL,
  storage_usage_percent INT NOT NULL,
  network_usage_percent INT NOT NULL,
  CONSTRAINT fk_vm_resources_vm FOREIGN KEY (vm_id) REFERENCES virtual_machines(id) ON DELETE CASCADE,
  CONSTRAINT chk_vm_resource_percent CHECK (
    cpu_usage_percent BETWEEN 0 AND 100 AND memory_usage_percent BETWEEN 0 AND 100
    AND storage_usage_percent BETWEEN 0 AND 100 AND network_usage_percent BETWEEN 0 AND 100
  ),
  INDEX idx_vm_resources_vm_recorded (vm_id, recorded_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS alerts (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  severity VARCHAR(12) NOT NULL,
  title VARCHAR(200) NOT NULL,
  detail VARCHAR(1000) NOT NULL,
  vm_id VARCHAR(36),
  status VARCHAR(20) NOT NULL DEFAULT 'Open',
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  owner_id VARCHAR(36),
  CONSTRAINT fk_alert_vm FOREIGN KEY (vm_id) REFERENCES virtual_machines(id) ON DELETE SET NULL,
  CONSTRAINT fk_alert_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_alert_severity CHECK (severity IN ('Critical', 'Warning', 'Info')),
  CONSTRAINT chk_alert_status CHECK (status IN ('Open', 'Acknowledged', 'Resolved')),
  INDEX idx_alert_owner_status (owner_id, status),
  INDEX idx_alert_created_at (created_at)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS app_settings (
  setting_id VARCHAR(36) NOT NULL PRIMARY KEY,
  user_id VARCHAR(36) NOT NULL,
  `key` VARCHAR(80) NOT NULL,
  `value` VARCHAR(500) NOT NULL,
  created_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  updated_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
  CONSTRAINT fk_app_settings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT uk_app_settings_user_key UNIQUE (user_id, `key`),
  INDEX idx_app_settings_user (user_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS resource_snapshots (
  id VARCHAR(36) NOT NULL PRIMARY KEY,
  resource_name VARCHAR(30) NOT NULL,
  utilization_percent INT NOT NULL,
  used_value VARCHAR(40) NOT NULL,
  total_value VARCHAR(40) NOT NULL,
  captured_at TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
  owner_id VARCHAR(36),
  CONSTRAINT fk_resource_owner FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  CONSTRAINT chk_resource_percent CHECK (utilization_percent BETWEEN 0 AND 100),
  CONSTRAINT chk_resource_name CHECK (resource_name IN ('cpu', 'memory', 'storage', 'network')),
  INDEX idx_resource_owner_time (owner_id, captured_at)
) ENGINE=InnoDB;

-- Example, owner_id NULL rows are shared starter data and are read-only through the API.
INSERT IGNORE INTO virtual_machines
  (id, name, description, os, cpu_cores, memory_gb, storage_gb, status, network_config, ip_address, mac_address,
   cpu_usage, memory_usage, storage_usage, network_usage, template, port_forwarding, start_on_boot, ssh_key, owner_id)
VALUES
  ('VM-01', 'VM-01', 'Web Server', 'Ubuntu 22.04 LTS', 2, 4, 50, 'Running', 'NAT', '192.168.1.10', '00:1A:2B:3C:4D:5E', 32, 48, 22, 23, 'Default Template', TRUE, TRUE, NULL, NULL),
  ('VM-02', 'VM-02', 'Database', 'CentOS 8', 4, 8, 100, 'Running', 'Bridged', '192.168.1.11', '00:1A:2B:3C:4D:5F', 68, 72, 41, 31, 'Default Template', FALSE, TRUE, 'Prod-Key', NULL),
  ('VM-03', 'VM-03', 'App Server', 'Windows Server 2019', 2, 8, 80, 'Error', 'NAT', '192.168.1.12', '00:1A:2B:3C:4D:60', 85, 76, 63, 44, 'Default Template', TRUE, FALSE, 'Ops-Key', NULL),
  ('VM-04', 'VM-04', 'Dev', 'Ubuntu 20.04 LTS', 2, 4, 60, 'Running', 'Host-only', '192.168.1.13', '00:1A:2B:3C:4D:61', 21, 34, 18, 12, 'Default Template', FALSE, TRUE, 'Dev-Key', NULL),
  ('VM-05', 'VM-05', 'Test', 'Debian 11', 2, 2, 40, 'Stopped', 'NAT', '192.168.1.14', '00:1A:2B:3C:4D:62', 0, 0, 12, 0, 'Default Template', TRUE, FALSE, 'QA-Key', NULL),
  ('VM-06', 'VM-06', 'Backup', 'Ubuntu 22.04 LTS', 4, 8, 200, 'Error', 'NAT', '192.168.1.15', '00:1A:2B:3C:4D:63', 78, 69, 48, 37, 'Default Template', TRUE, TRUE, 'Backup-Key', NULL);

INSERT IGNORE INTO networks (id, network_name, network_type, subnet, gateway, description, status, owner_id) VALUES
  ('NET-01', 'Default NAT', 'NAT', '192.168.1.0/24', '192.168.1.1', 'Shared private network', 'Active', NULL),
  ('NET-02', 'Development LAN', 'Host-only', '10.20.0.0/24', '10.20.0.1', 'Isolated development network', 'Active', NULL),
  ('NET-03', 'Office Bridge', 'Bridged', '172.16.10.0/24', '172.16.10.1', 'Shared office network', 'Active', NULL);

INSERT IGNORE INTO vm_networks (id, vm_id, network_id) VALUES
  ('LINK-01', 'VM-01', 'NET-01'), ('LINK-02', 'VM-02', 'NET-03'),
  ('LINK-03', 'VM-03', 'NET-01'), ('LINK-04', 'VM-04', 'NET-02');

INSERT IGNORE INTO vm_resources
  (id, vm_id, recorded_at, cpu_usage_percent, memory_usage_percent, storage_usage_percent, network_usage_percent)
VALUES
  ('METRIC-01', 'VM-01', CURRENT_TIMESTAMP(6), 32, 48, 22, 23),
  ('METRIC-02', 'VM-02', CURRENT_TIMESTAMP(6), 68, 72, 41, 31),
  ('METRIC-03', 'VM-03', CURRENT_TIMESTAMP(6), 85, 76, 63, 44),
  ('METRIC-04', 'VM-04', CURRENT_TIMESTAMP(6), 21, 34, 18, 12),
  ('METRIC-05', 'VM-05', CURRENT_TIMESTAMP(6), 0, 0, 12, 0),
  ('METRIC-06', 'VM-06', CURRENT_TIMESTAMP(6), 78, 69, 48, 37);

INSERT IGNORE INTO alerts (id, severity, title, detail, vm_id, status, owner_id) VALUES
  ('ALERT-01', 'Critical', 'VM-03 is in an error state', 'App Server is not responding. Review the VM state.', 'VM-03', 'Open', NULL),
  ('ALERT-02', 'Warning', 'High CPU usage on VM-03', 'CPU utilization is above the 80% threshold.', 'VM-03', 'Open', NULL),
  ('ALERT-03', 'Critical', 'VM-06 is in an error state', 'Backup is not responding. Review the VM state.', 'VM-06', 'Open', NULL);

INSERT IGNORE INTO resource_snapshots (id, resource_name, utilization_percent, used_value, total_value, owner_id) VALUES
  ('RES-CPU', 'cpu', 42, '4.2 GHz', '10 GHz', NULL),
  ('RES-MEM', 'memory', 58, '11.6 GB', '20 GB', NULL),
  ('RES-STO', 'storage', 36, '72 GB', '200 GB', NULL),
  ('RES-NET', 'network', 23, '1.2 MB/s', '8.7 MB/s', NULL);

-- Reference queries (parameterize :owner_id/:id in applications; never concatenate untrusted values).
-- VMs, shared starter fleet plus the signed-in user's own VMs:
SELECT * FROM virtual_machines WHERE owner_id IS NULL OR owner_id = :owner_id ORDER BY created_at DESC;
-- Create, update status, and delete examples:
-- INSERT INTO virtual_machines (id,name,description,os,cpu_cores,memory_gb,storage_gb,status,network_config,owner_id) VALUES (:id,:name,:description,:os,:cpu,:memory,:storage,'Running',:network,:owner_id);
-- UPDATE virtual_machines SET status = 'Stopped' WHERE id = :id AND owner_id = :owner_id;
-- DELETE FROM virtual_machines WHERE id = :id AND owner_id = :owner_id;
-- Dashboard fleet status:
SELECT COUNT(*) AS total,
       SUM(status = 'Running') AS running,
       SUM(status = 'Stopped') AS stopped,
       SUM(status = 'Error') AS failed
FROM virtual_machines WHERE owner_id IS NULL OR owner_id = :owner_id;
-- Utilization metrics:
SELECT r.vm_id, r.recorded_at, r.cpu_usage_percent, r.memory_usage_percent,
       r.storage_usage_percent, r.network_usage_percent
FROM vm_resources r JOIN virtual_machines v ON v.id = r.vm_id
WHERE v.owner_id IS NULL OR v.owner_id = :owner_id
ORDER BY r.recorded_at DESC;
-- Networks and VM-network associations:
SELECT n.* FROM networks n LEFT JOIN vm_networks a ON a.network_id = n.id
WHERE n.owner_id IS NULL OR n.owner_id = :owner_id;