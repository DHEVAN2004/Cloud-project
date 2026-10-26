package com.cloudvm.manager.dto;

import jakarta.validation.constraints.*;
import com.fasterxml.jackson.annotation.JsonAlias;
import java.time.Instant;
import java.util.List;

public final class ApiDtos {
    private ApiDtos() {}
    public record RegisterRequest(@JsonAlias("username") @NotBlank @Size(max = 80) String name,
                                 @NotBlank @Email @Size(max = 254) String email,
                                 @NotBlank @Size(min = 10, max = 72) String password) {}
    public record LoginRequest(@NotBlank @Email String email, @NotBlank String password) {}
    public record UserDto(String id, String username, String name, String email, String role) {}
    public record AuthResponse(String accessToken, String tokenType, long expiresIn, UserDto user) {}
    public record VmRequest(@NotBlank @Size(max = 100) String name, @Size(max = 500) String description,
                            @JsonAlias("os") @NotBlank @Size(max = 80) String operatingSystem, @Min(1) @Max(128) int cpuCores,
                            @DecimalMin("0.25") @DecimalMax("4096") double memoryGb,
                            @DecimalMin("1") @DecimalMax("100000") double storageGb,
                            @NotBlank @Pattern(regexp = "NAT|Bridged|Host-only") String networkConfig,
                            boolean portForwarding, boolean startOnBoot, @Size(max = 100) String template,
                            @Size(max = 120) String sshKey) {}
    public record VmStatusRequest(@NotBlank @Pattern(regexp = "Running|Stopped|Error") String status) {}
    public record VmDto(String id, String name, String description, String operatingSystem, String os, int cpuCores, double memoryGb,
                        double storageGb, String networkConfig, String status, String ipAddress, String macAddress,
                        int cpuUsage, int memoryUsage, int storageUsage, int networkUsage, String template,
                        boolean portForwarding, boolean startOnBoot, String sshKey, Instant createdAt, Instant updatedAt) {}
    public record NetworkRequest(@JsonAlias("name") @NotBlank @Size(max = 100) String networkName,
                                 @JsonAlias("mode") @NotBlank @Pattern(regexp = "NAT|Bridged|Host-only") String networkType,
                                 @JsonAlias("cidrBlock") @NotBlank @Pattern(regexp = "(?i)(?:\\d{1,3}\\.){3}\\d{1,3}/\\d{1,2}|[0-9a-fA-F:]+/\\d{1,3}") String subnet,
                                 @Size(max = 45) String gateway, @Size(max = 500) String description,
                                 @Pattern(regexp = "Active|Inactive") String status) {}
    public record NetworkDto(String id, String networkName, String networkType, String subnet, String gateway, String description, String status) {}
    public record AlertStatusRequest(@NotBlank @Pattern(regexp = "Open|Acknowledged|Resolved") String status) {}
    public record AlertDto(String id, String severity, String title, String detail, String vmId, String status, Instant createdAt) {}
    public record MetricDto(String vmId, Instant recordedAt, int cpuUsagePercent, int memoryUsagePercent,
                            int storageUsagePercent, int networkUsagePercent) {}
    public record VmResourceRequest(@Min(0) @Max(100) int cpuUsagePercent,
                                    @Min(0) @Max(100) int memoryUsagePercent,
                                    @Min(0) @Max(100) int storageUsagePercent,
                                    @Min(0) @Max(100) int networkUsagePercent) {}
    public record VmResourceDto(String id, String vmId, Instant recordedAt, int cpuUsagePercent,
                                int memoryUsagePercent, int storageUsagePercent, int networkUsagePercent) {}
    public record ResourceDto(String name, int percent, String used, String total) {}
    public record DashboardDto(long totalVms, long runningVms, long stoppedVms, long errorVms,
                               List<ResourceDto> resources, Instant timestamp) {}
    public record SettingsRequest(@NotBlank @Pattern(regexp = "us-east|us-west|eu-west|ap-southeast") String region,
                                  @Min(0) @Max(3600) int refreshInterval, boolean emailAlerts,
                                  boolean criticalOnly, boolean maintenanceNotices) {}
    public record SettingsDto(String region, int refreshInterval, boolean emailAlerts, boolean criticalOnly, boolean maintenanceNotices) {}
    public record ApiError(Instant timestamp, int status, String error, String message, String path, Object details) {}
}
