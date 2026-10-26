package com.cloudvm.manager.controller;

import com.cloudvm.manager.dto.ApiDtos.*;
import com.cloudvm.manager.repository.AppUserRepository;
import com.cloudvm.manager.service.ApiException;
import com.cloudvm.manager.service.NetworkService;
import jakarta.validation.Valid;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/networks")
public class NetworkController {
    private final NetworkService networks;
    private final AppUserRepository users;
    public NetworkController(NetworkService networks, AppUserRepository users) { this.networks = networks; this.users = users; }
    @GetMapping public List<NetworkDto> list(@org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) { return networks.list(owner(jwt)); }
    @PostMapping @ResponseStatus(HttpStatus.CREATED)
    public NetworkDto create(@Valid @RequestBody NetworkRequest request, @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {
        return networks.create(request, owner(jwt));
    }
    @GetMapping("/{id}") public NetworkDto get(@PathVariable String id, @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) { return networks.get(id, owner(jwt)); }
    @PutMapping("/{id}") public NetworkDto update(@PathVariable String id, @Valid @RequestBody NetworkRequest request,
                                                   @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) {
        return networks.update(id, request, owner(jwt));
    }
    @DeleteMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id, @org.springframework.security.core.annotation.AuthenticationPrincipal Jwt jwt) { networks.delete(id, owner(jwt)); }
    private String owner(Jwt jwt) {
        return users.findByEmailIgnoreCase(jwt.getSubject()).orElseThrow(() -> ApiException.notFound("User")).getId();
    }
}
