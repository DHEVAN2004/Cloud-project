package com.cloudvm.manager.controller;

import com.cloudvm.manager.dto.ApiDtos.*;
import com.cloudvm.manager.repository.AppUserRepository;
import com.cloudvm.manager.service.ApiException;
import com.cloudvm.manager.service.VirtualMachineService;
import com.cloudvm.manager.service.WorkspaceService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class WorkspaceController {
    private final WorkspaceService workspace;
    private final VirtualMachineService vms;
    private final AppUserRepository users;
    public WorkspaceController(WorkspaceService workspace, VirtualMachineService vms, AppUserRepository users) {
        this.workspace = workspace; this.vms = vms; this.users = users;
    }
    @GetMapping({"/dashboard", "/dashboard/stats"}) public DashboardDto dashboard(@org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {
        return vms.dashboard(owner(jwt));
    }
    @GetMapping({"/resources", "/dashboard/resources"}) public List<ResourceDto> resources(@org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {
        return vms.dashboard(owner(jwt)).resources();
    }
    @GetMapping("/metrics") public List<MetricDto> metrics(@RequestParam(required = false) String vmId,
                              @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) { return vms.metrics(owner(jwt), vmId); }
    @GetMapping("/alerts") public List<AlertDto> alerts(@org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {
        return workspace.alerts(owner(jwt));
    }
    @PatchMapping({"/alerts/{id}/status", "/alerts/{id}"}) public AlertDto alertStatus(@PathVariable String id, @Valid @RequestBody AlertStatusRequest request,
                               @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {
        return workspace.status(id, request.status(), owner(jwt));
    }
    @GetMapping("/settings") public SettingsDto settings(@org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {
        return workspace.getSettings(owner(jwt));
    }
    @PutMapping("/settings") public SettingsDto settings(@Valid @RequestBody SettingsRequest request,
                               @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {
        return workspace.putSettings(owner(jwt), request);
    }
    private String owner(Jwt jwt) {
        return users.findByEmailIgnoreCase(jwt.getSubject()).orElseThrow(() -> ApiException.notFound("User")).getId();
    }
}
