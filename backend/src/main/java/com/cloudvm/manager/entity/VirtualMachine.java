package com.cloudvm.manager.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "virtual_machines", indexes = @Index(name = "idx_vm_owner_status", columnList = "owner_id,status"))
public class VirtualMachine {
    @Id @Column(length = 36) private String id;
    @Column(nullable = false, length = 100) private String name;
    @Column(length = 500) private String description;
    @Column(nullable = false, length = 80) private String os;
    @Column(name = "cpu_cores", nullable = false) private int cpuCores;
    @Column(name = "memory_gb", nullable = false) private double memoryGb;
    @Column(name = "storage_gb", nullable = false) private double storageGb;
    @Column(nullable = false, length = 20) private String status;
    @Column(name = "network_config", nullable = false, length = 80) private String networkConfig;
    @Column(name = "ip_address", length = 45) private String ipAddress;
    @Column(name = "mac_address", length = 17) private String macAddress;
    @Column(name = "cpu_usage", nullable = false) private int cpuUsage;
    @Column(name = "memory_usage", nullable = false) private int memoryUsage;
    @Column(name = "storage_usage", nullable = false) private int storageUsage;
    @Column(name = "network_usage", nullable = false) private int networkUsage;
    @Column(length = 100) private String template;
    @Column(name = "port_forwarding", nullable = false) private boolean portForwarding;
    @Column(name = "start_on_boot", nullable = false) private boolean startOnBoot;
    @Column(name = "ssh_key", length = 120) private String sshKey;
    @Column(name = "created_at", nullable = false) private Instant createdAt;
    @Column(name = "updated_at", nullable = false) private Instant updatedAt;
    @Column(name = "owner_id", length = 36) private String ownerId;

    protected VirtualMachine() {}
    public VirtualMachine(String name, String description, String os, int cpuCores, double memoryGb,
                          double storageGb, String networkConfig, boolean portForwarding, boolean startOnBoot,
                          String template, String sshKey, String ownerId) {
        this.id = java.util.UUID.randomUUID().toString();
        this.name = name; this.description = description; this.os = os; this.cpuCores = cpuCores;
        this.memoryGb = memoryGb; this.storageGb = storageGb; this.networkConfig = networkConfig;
        this.portForwarding = portForwarding; this.startOnBoot = startOnBoot; this.template = template;
        this.sshKey = sshKey; this.ownerId = ownerId; this.status = "Running"; this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
        this.cpuUsage = 0; this.memoryUsage = 0; this.storageUsage = 0; this.networkUsage = 0;
    }
    public String getId() { return id; }
    public String getName() { return name; }
    public String getDescription() { return description; }
    public String getOs() { return os; }
    public int getCpuCores() { return cpuCores; }
    public double getMemoryGb() { return memoryGb; }
    public double getStorageGb() { return storageGb; }
    public String getStatus() { return status; }
    public String getNetworkConfig() { return networkConfig; }
    public String getIpAddress() { return ipAddress; }
    public String getMacAddress() { return macAddress; }
    public int getCpuUsage() { return cpuUsage; }
    public int getMemoryUsage() { return memoryUsage; }
    public int getStorageUsage() { return storageUsage; }
    public int getNetworkUsage() { return networkUsage; }
    public String getTemplate() { return template; }
    public boolean isPortForwarding() { return portForwarding; }
    public boolean isStartOnBoot() { return startOnBoot; }
    public String getSshKey() { return sshKey; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public String getOwnerId() { return ownerId; }
    public void update(String name, String description, String os, int cpuCores, double memoryGb, double storageGb,
                       String networkConfig, boolean portForwarding, boolean startOnBoot, String template, String sshKey) {
        this.name = name; this.description = description; this.os = os; this.cpuCores = cpuCores;
        this.memoryGb = memoryGb; this.storageGb = storageGb; this.networkConfig = networkConfig;
        this.portForwarding = portForwarding; this.startOnBoot = startOnBoot; this.template = template; this.sshKey = sshKey;
    }
    public void setStatus(String status) { this.status = status; }

    @PreUpdate
    void touchUpdatedAt() { this.updatedAt = Instant.now(); }
}
