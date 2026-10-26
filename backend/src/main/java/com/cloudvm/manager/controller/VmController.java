package com.cloudvm.manager.controller;

import com.cloudvm.manager.dto.ApiDtos.*;
import com.cloudvm.manager.repository.AppUserRepository;
import com.cloudvm.manager.service.ApiException;
import com.cloudvm.manager.service.NetworkService;
import com.cloudvm.manager.service.VirtualMachineService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
public class VmController {
    private final VirtualMachineService vms;
    private final NetworkService networks;
    private final AppUserRepository users;
    public VmController(VirtualMachineService vms, NetworkService networks, AppUserRepository users) {
        this.vms = vms; this.networks = networks; this.users = users;
    }
    @GetMapping("/vms") public List<VmDto> list(@org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) { return vms.list(owner(jwt)); }
    @PostMapping("/vms") @ResponseStatus(HttpStatus.CREATED)
    public VmDto create(@Valid @RequestBody VmRequest request, @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {
        return vms.create(request, owner(jwt));
    }
    @GetMapping("/vms/{id}") public VmDto get(@PathVariable String id, @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) { return vms.get(id, owner(jwt)); }
    @PutMapping("/vms/{id}") public VmDto update(@PathVariable String id, @Valid @RequestBody VmRequest request,
                                                  @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {
        return vms.update(id, request, owner(jwt));
    }
    @PatchMapping("/vms/{id}/status") public VmDto status(@PathVariable String id, @Valid @RequestBody VmStatusRequest request,
                                                           @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {
        return vms.status(id, request.status(), owner(jwt));
    }
    @DeleteMapping("/vms/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id, @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) { vms.delete(id, owner(jwt)); }
    @GetMapping("/vms/{id}/networks") public List<NetworkDto> vmNetworks(@PathVariable String id,
                                                      @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {
        vms.get(id, owner(jwt));
        return networks.vmNetworks(id, owner(jwt));
    }
    @GetMapping({"/vms/{id}/resources", "/vms/{id}/metrics"}) public List<VmResourceDto> resourceHistory(@PathVariable String id,
                                                @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {
        return vms.resourceHistory(id, owner(jwt));
    }
    @PostMapping({"/vms/{id}/resources", "/vms/{id}/metrics"}) @ResponseStatus(HttpStatus.CREATED)
    public VmResourceDto createResource(@PathVariable String id, @Valid @RequestBody VmResourceRequest request,
                                        @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {
        return vms.createResource(id, request, owner(jwt));
    }
    @GetMapping("/vms/{id}/resources/{resourceId}") public VmResourceDto getResource(@PathVariable String id, @PathVariable String resourceId,
                                                @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {
        return vms.getResource(id, resourceId, owner(jwt));
    }
    @PutMapping("/vms/{id}/resources/{resourceId}") public VmResourceDto updateResource(@PathVariable String id, @PathVariable String resourceId,
                                                     @Valid @RequestBody VmResourceRequest request,
                                                     @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {
        return vms.updateResource(id, resourceId, request, owner(jwt));
    }
    @DeleteMapping("/vms/{id}/resources/{resourceId}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteResource(@PathVariable String id, @PathVariable String resourceId,
                               @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {
        vms.deleteResource(id, resourceId, owner(jwt));
    }
    @PutMapping("/vms/{id}/networks/{networkId}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void associate(@PathVariable String id, @PathVariable String networkId,
                          @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) { networks.associate(id, networkId, owner(jwt)); }
    @DeleteMapping("/vms/{id}/networks/{networkId}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void disassociate(@PathVariable String id, @PathVariable String networkId,
                             @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) { networks.disassociate(id, networkId, owner(jwt)); }
    private String owner(Jwt jwt) {
        return users.findByEmailIgnoreCase(jwt.getSubject()).orElseThrow(() -> ApiException.notFound("User")).getId();
    }
}
