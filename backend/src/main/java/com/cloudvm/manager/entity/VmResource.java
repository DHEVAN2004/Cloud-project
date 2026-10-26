package com.cloudvm.manager.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "vm_resources", indexes = @Index(name = "idx_vm_resources_vm_recorded", columnList = "vm_id,recorded_at"))
public class VmResource {
    @Id @Column(length = 36) private String id;
    @Column(name = "vm_id", nullable = false, length = 36) private String vmId;
    @Column(name = "recorded_at", nullable = false) private Instant recordedAt;
    @Column(name = "cpu_usage_percent", nullable = false) private int cpuUsagePercent;
    @Column(name = "memory_usage_percent", nullable = false) private int memoryUsagePercent;
    @Column(name = "storage_usage_percent", nullable = false) private int storageUsagePercent;
    @Column(name = "network_usage_percent", nullable = false) private int networkUsagePercent;

    protected VmResource() {}
    public VmResource(String vmId, int cpu, int memory, int storage, int network) {
        this.id = java.util.UUID.randomUUID().toString();
        this.vmId = vmId;
        this.recordedAt = Instant.now();
        update(cpu, memory, storage, network);
    }
    public String getId() { return id; }
    public String getVmId() { return vmId; }
    public Instant getRecordedAt() { return recordedAt; }
    public int getCpuUsagePercent() { return cpuUsagePercent; }
    public int getMemoryUsagePercent() { return memoryUsagePercent; }
    public int getStorageUsagePercent() { return storageUsagePercent; }
    public int getNetworkUsagePercent() { return networkUsagePercent; }
    public void update(int cpu, int memory, int storage, int network) {
        this.cpuUsagePercent = cpu;
        this.memoryUsagePercent = memory;
        this.storageUsagePercent = storage;
        this.networkUsagePercent = network;
    }
}
