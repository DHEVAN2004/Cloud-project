package com.cloudvm.manager.service;

import com.cloudvm.manager.dto.ApiDtos.*;
import com.cloudvm.manager.entity.AppUser;
import com.cloudvm.manager.entity.AppSetting;
import com.cloudvm.manager.repository.AppUserRepository;
import com.cloudvm.manager.repository.AppSettingRepository;
import java.time.Instant;
import java.util.List;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final AppUserRepository users;
    private final AppSettingRepository settings;
    private final PasswordEncoder passwords;
    private final AuthenticationManager authentication;
    private final JwtEncoder encoder;
    private final long ttl;
    public AuthService(AppUserRepository users, AppSettingRepository settings, PasswordEncoder passwords,
                       AuthenticationManager authentication, JwtEncoder encoder,
                       @Value("${app.jwt.ttl-seconds}") long ttl) {
        this.users = users; this.settings = settings; this.passwords = passwords;
        this.authentication = authentication; this.encoder = encoder; this.ttl = ttl;
    }
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.email().trim().toLowerCase(java.util.Locale.ROOT);
        String username = request.name().trim();
        if (users.existsByEmailIgnoreCase(email)) throw ApiException.conflict("An account with this email already exists");
        if (users.existsByUsernameIgnoreCase(username)) throw ApiException.conflict("An account with this username already exists");
        AppUser user = users.save(new AppUser(username, email, passwords.encode(request.password())));
        settings.saveAll(AppSetting.defaults(user.getId()));
        return token(user);
    }
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        String email = request.email().trim().toLowerCase(java.util.Locale.ROOT);
        try {
            authentication.authenticate(new UsernamePasswordAuthenticationToken(email, request.password()));
        } catch (BadCredentialsException | org.springframework.security.core.userdetails.UsernameNotFoundException ex) {
            throw new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password");
        }
        return token(users.findByEmailIgnoreCase(email).orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password")));
    }
    private AuthResponse token(AppUser user) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder().issuer("cloudvm-manager").subject(user.getEmail())
            .issuedAt(now).expiresAt(now.plusSeconds(ttl)).claim("roles", List.of("ROLE_" + user.getRole())).build();
        String jwt = encoder.encode(JwtEncoderParameters.from(JwsHeader.with(MacAlgorithm.HS256).build(), claims)).getTokenValue();
        return new AuthResponse(jwt, "Bearer", ttl, DtoMapper.user(user));
    }
}
