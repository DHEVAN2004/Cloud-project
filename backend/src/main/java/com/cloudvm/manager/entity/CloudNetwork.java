package com.cloudvm.manager.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "networks", indexes = @Index(name = "idx_network_owner", columnList = "owner_id"))
public class CloudNetwork {
    @Id @Column(length = 36) private String id;
    @Column(name = "network_name", nullable = false, length = 100) private String name;
    @Column(name = "network_type", nullable = false, length = 20) private String mode;
    @Column(name = "subnet", nullable = false, length = 43) private String cidrBlock;
    @Column(name = "gateway", length = 45) private String gateway;
    @Column(length = 500) private String description;
    @Column(nullable = false, length = 20) private String status;
    @Column(name = "owner_id", length = 36) private String ownerId;
    protected CloudNetwork() {}
    public CloudNetwork(String name, String mode, String cidrBlock, String gateway, String description, String ownerId) {
        this.id = java.util.UUID.randomUUID().toString(); this.name = name; this.mode = mode;
        this.cidrBlock = cidrBlock; this.gateway = gateway; this.description = description; this.status = "Active"; this.ownerId = ownerId;
    }
    public String getId() { return id; }
    public String getName() { return name; }
    public String getMode() { return mode; }
    public String getCidrBlock() { return cidrBlock; }
    public String getGateway() { return gateway; }
    public String getDescription() { return description; }
    public String getStatus() { return status; }
    public String getOwnerId() { return ownerId; }
    public void update(String name, String mode, String cidrBlock, String gateway, String description, String status) {
        this.name = name; this.mode = mode; this.cidrBlock = cidrBlock; this.gateway = gateway;
        this.description = description; this.status = status;
    }
}
