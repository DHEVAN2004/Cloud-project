package com.cloudvm.manager.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "alerts", indexes = @Index(name = "idx_alert_owner_status", columnList = "owner_id,status"))
public class CloudAlert {
    @Id @Column(length = 36) private String id;
    @Column(nullable = false, length = 12) private String severity;
    @Column(nullable = false, length = 200) private String title;
    @Column(nullable = false, length = 1000) private String detail;
    @Column(name = "vm_id", length = 36) private String vmId;
    @Column(nullable = false, length = 20) private String status;
    @Column(name = "created_at", nullable = false) private Instant createdAt;
    @Column(name = "owner_id", length = 36) private String ownerId;
    protected CloudAlert() {}
    public CloudAlert(String severity, String title, String detail, String vmId, String ownerId) {
        this.id = java.util.UUID.randomUUID().toString(); this.severity = severity; this.title = title;
        this.detail = detail; this.vmId = vmId; this.ownerId = ownerId; this.status = "Open"; this.createdAt = Instant.now();
    }
    public String getId() { return id; }
    public String getSeverity() { return severity; }
    public String getTitle() { return title; }
    public String getDetail() { return detail; }
    public String getVmId() { return vmId; }
    public String getStatus() { return status; }
    public Instant getCreatedAt() { return createdAt; }
    public String getOwnerId() { return ownerId; }
    public void setStatus(String status) { this.status = status; }
}
