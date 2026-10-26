package com.cloudvm.manager.entity;

import jakarta.persistence.*;
import java.time.Instant;
import java.util.List;

@Entity
@Table(name = "app_settings", uniqueConstraints = @UniqueConstraint(
    name = "uk_app_settings_user_key", columnNames = {"user_id", "key"}),
    indexes = @Index(name = "idx_app_settings_user", columnList = "user_id"))
public class AppSetting {
    @Id @Column(name = "setting_id", length = 36) private String settingId;
    @Column(name = "user_id", nullable = false, length = 36) private String userId;
    @Column(name = "`key`", nullable = false, length = 80) private String key;
    @Column(name = "`value`", nullable = false, length = 500) private String value;
    @Column(name = "created_at", nullable = false) private Instant createdAt;
    @Column(name = "updated_at", nullable = false) private Instant updatedAt;

    protected AppSetting() {}
    public AppSetting(String userId, String key, String value) {
        this.settingId = java.util.UUID.randomUUID().toString();
        this.userId = userId;
        this.key = key;
        this.value = value;
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }
    public static List<AppSetting> defaults(String userId) {
        return List.of(new AppSetting(userId, "region", "us-east"),
            new AppSetting(userId, "refreshInterval", "60"),
            new AppSetting(userId, "emailAlerts", "true"),
            new AppSetting(userId, "criticalOnly", "false"),
            new AppSetting(userId, "maintenanceNotices", "true"));
    }
    public String getSettingId() { return settingId; }
    public String getUserId() { return userId; }
    public String getKey() { return key; }
    public String getValue() { return value; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }
    public void setValue(String value) { this.value = value; this.updatedAt = Instant.now(); }
}
