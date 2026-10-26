package com.cloudvm.manager.service;

import com.cloudvm.manager.dto.ApiDtos.*;
import com.cloudvm.manager.entity.VirtualMachine;
import com.cloudvm.manager.repository.VirtualMachineRepository;
import com.cloudvm.manager.repository.VmNetworkLinkRepository;
import com.cloudvm.manager.repository.VmResourceRepository;
import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class VirtualMachineService {
    private final VirtualMachineRepository vms;
    private final VmNetworkLinkRepository links;
    private final VmResourceRepository resources;
    public VirtualMachineService(VirtualMachineRepository vms, VmNetworkLinkRepository links, VmResourceRepository resources) {
        this.vms = vms; this.links = links; this.resources = resources;
    }
    @Transactional(readOnly = true)
    public List<VmDto> list(String owner) {
        List<VirtualMachine> rows = new ArrayList<>(vms.findByOwnerIdIsNullOrderByCreatedAtDesc());
        rows.addAll(vms.findByOwnerIdOrderByCreatedAtDesc(owner));
        return rows.stream().map(DtoMapper::vm).toList();
    }
    @Transactional
    public VmDto create(VmRequest req, String owner) {
        return DtoMapper.vm(vms.save(new VirtualMachine(req.name().trim(), req.description(), req.operatingSystem(), req.cpuCores(),
            req.memoryGb(), req.storageGb(), req.networkConfig(), req.portForwarding(), req.startOnBoot(),
            req.template(), req.sshKey(), owner)));
    }
    @Transactional(readOnly = true)
    public VmDto get(String id, String owner) { return DtoMapper.vm(findVisible(id, owner)); }
    @Transactional
    public VmDto update(String id, VmRequest req, String owner) {
        VirtualMachine vm = findOwned(id, owner);
        vm.update(req.name().trim(), req.description(), req.operatingSystem(), req.cpuCores(), req.memoryGb(), req.storageGb(),
            req.networkConfig(), req.portForwarding(), req.startOnBoot(), req.template(), req.sshKey());
        return DtoMapper.vm(vm);
    }
    @Transactional
    public VmDto status(String id, String status, String owner) {
        VirtualMachine vm = findOwned(id, owner);
        vm.setStatus(status);
        return DtoMapper.vm(vm);
    }
    @Transactional
    public void delete(String id, String owner) {
        VirtualMachine vm = findOwned(id, owner);
        links.deleteByVmId(vm.getId());
        vms.delete(vm);
    }
    @Transactional(readOnly = true)
    public List<MetricDto> metrics(String owner, String vmId) {
        List<String> visibleVmIds = list(owner).stream().map(VmDto::id)
            .filter(id -> vmId == null || vmId.equals(id)).toList();
        if (visibleVmIds.isEmpty()) return List.of();
        return resources.findByVmIdInOrderByRecordedAtDesc(visibleVmIds).stream().map(DtoMapper::metric).toList();
    }
    @Transactional(readOnly = true)
    public List<VmResourceDto> resourceHistory(String vmId, String owner) {
        findVisible(vmId, owner);
        return resources.findByVmIdOrderByRecordedAtDesc(vmId).stream().map(DtoMapper::resource).toList();
    }
    @Transactional(readOnly = true)
    public VmResourceDto getResource(String vmId, String resourceId, String owner) {
        findVisible(vmId, owner);
        return DtoMapper.resource(resources.findByIdAndVmId(resourceId, vmId).orElseThrow(() -> ApiException.notFound("VM resource")));
    }
    @Transactional
    public VmResourceDto createResource(String vmId, VmResourceRequest req, String owner) {
        findOwned(vmId, owner);
        var row = new com.cloudvm.manager.entity.VmResource(vmId, req.cpuUsagePercent(), req.memoryUsagePercent(),
            req.storageUsagePercent(), req.networkUsagePercent());
        return DtoMapper.resource(resources.save(row));
    }
    @Transactional
    public VmResourceDto updateResource(String vmId, String resourceId, VmResourceRequest req, String owner) {
        findOwned(vmId, owner);
        var row = resources.findByIdAndVmId(resourceId, vmId).orElseThrow(() -> ApiException.notFound("VM resource"));
        row.update(req.cpuUsagePercent(), req.memoryUsagePercent(), req.storageUsagePercent(), req.networkUsagePercent());
        return DtoMapper.resource(row);
    }
    @Transactional
    public void deleteResource(String vmId, String resourceId, String owner) {
        findOwned(vmId, owner);
        resources.delete(resources.findByIdAndVmId(resourceId, vmId).orElseThrow(() -> ApiException.notFound("VM resource")));
    }
    @Transactional(readOnly = true)
    public DashboardDto dashboard(String owner) {
        List<VirtualMachine> rows = list(owner).stream().map(v -> findVisible(v.id(), owner)).toList();
        long running = rows.stream().filter(v -> "Running".equals(v.getStatus())).count();
        long stopped = rows.stream().filter(v -> "Stopped".equals(v.getStatus())).count();
        long failed = rows.stream().filter(v -> "Error".equals(v.getStatus())).count();
        List<VirtualMachine> active = rows.stream().filter(v -> "Running".equals(v.getStatus())).toList();
        return new DashboardDto(rows.size(), running, stopped, failed, List.of(
            resource("cpu", active, VirtualMachine::getCpuUsage),
            resource("memory", active, VirtualMachine::getMemoryUsage),
            resource("storage", active, VirtualMachine::getStorageUsage),
            resource("network", active, VirtualMachine::getNetworkUsage)), Instant.now());
    }
    private ResourceDto resource(String name, List<VirtualMachine> active, java.util.function.ToIntFunction<VirtualMachine> val) {
        int pct = active.isEmpty() ? 0 : (int) Math.round(active.stream().mapToInt(val).average().orElse(0));
        return new ResourceDto(name, pct, pct + "%", "100%");
    }
    private VirtualMachine findVisible(String id, String owner) {
        return vms.findByIdAndOwnerId(id, owner).or(() -> vms.findById(id).filter(v -> v.getOwnerId() == null))
            .orElseThrow(() -> ApiException.notFound("Virtual machine"));
    }
    private VirtualMachine findOwned(String id, String owner) {
        VirtualMachine found = vms.findById(id).orElseThrow(() -> ApiException.notFound("Virtual machine"));
        if (found.getOwnerId() == null) throw new ApiException(HttpStatus.FORBIDDEN, "Seeded shared virtual machines are read-only");
        if (!owner.equals(found.getOwnerId())) throw ApiException.forbidden();
        return found;
    }
}
