package com.cloudvm.manager.entity;

import jakarta.persistence.*;
import java.time.Instant;

@Entity
@Table(name = "users", uniqueConstraints = {
    @UniqueConstraint(name = "uk_users_username", columnNames = "username"),
    @UniqueConstraint(name = "uk_users_email", columnNames = "email")
})
public class AppUser {
    @Id @Column(length = 36) private String id;
    @Column(nullable = false, length = 80) private String username;
    @Column(nullable = false, length = 254) private String email;
    @Column(name = "password_hash", nullable = false, length = 100) private String passwordHash;
    @Column(nullable = false, length = 20) private String role;
    @Column(name = "created_at", nullable = false) private Instant createdAt;
    @Column(name = "updated_at", nullable = false) private Instant updatedAt;

    protected AppUser() {}
    public AppUser(String username, String email, String passwordHash) {
        this.id = java.util.UUID.randomUUID().toString();
        this.username = username;
        this.email = email.toLowerCase(java.util.Locale.ROOT);
        this.passwordHash = passwordHash;
        this.role = "USER";
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }
    public String getId() { return id; }
    public String getUsername() { return username; }
    public String getName() { return username; }
    public String getEmail() { return email; }
    public String getPasswordHash() { return passwordHash; }
    public String getRole() { return role; }
    public Instant getCreatedAt() { return createdAt; }
    public Instant getUpdatedAt() { return updatedAt; }

    @PreUpdate
    void touchUpdatedAt() { this.updatedAt = Instant.now(); }
}
