package com.cloudvm.manager.service;

import com.cloudvm.manager.dto.ApiDtos.*;
import com.cloudvm.manager.entity.*;

public final class DtoMapper {
    private DtoMapper() {}
    public static UserDto user(AppUser u) {
        return new UserDto(u.getId(), u.getUsername(), u.getUsername(), u.getEmail(), u.getRole());
    }
    public static VmDto vm(VirtualMachine v) {
        return new VmDto(v.getId(), v.getName(), v.getDescription(), v.getOs(), v.getOs(), v.getCpuCores(), v.getMemoryGb(),
            v.getStorageGb(), v.getNetworkConfig(), v.getStatus(), v.getIpAddress(), v.getMacAddress(),
            v.getCpuUsage(), v.getMemoryUsage(), v.getStorageUsage(), v.getNetworkUsage(), v.getTemplate(),
            v.isPortForwarding(), v.isStartOnBoot(), v.getSshKey(), v.getCreatedAt(), v.getUpdatedAt());
    }
    public static NetworkDto network(CloudNetwork n) {
        return new NetworkDto(n.getId(), n.getName(), n.getMode(), n.getCidrBlock(), n.getGateway(), n.getDescription(), n.getStatus());
    }
    public static AlertDto alert(CloudAlert a) { return new AlertDto(a.getId(), a.getSeverity(), a.getTitle(), a.getDetail(), a.getVmId(), a.getStatus(), a.getCreatedAt()); }
    public static VmResourceDto resource(VmResource r) {
        return new VmResourceDto(r.getId(), r.getVmId(), r.getRecordedAt(), r.getCpuUsagePercent(),
            r.getMemoryUsagePercent(), r.getStorageUsagePercent(), r.getNetworkUsagePercent());
    }
    public static MetricDto metric(VmResource r) {
        return new MetricDto(r.getVmId(), r.getRecordedAt(), r.getCpuUsagePercent(),
            r.getMemoryUsagePercent(), r.getStorageUsagePercent(), r.getNetworkUsagePercent());
    }
}
