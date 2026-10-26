package com.cloudvm.manager.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "vm_networks", uniqueConstraints = @UniqueConstraint(name = "uk_vm_network_pair", columnNames = {"vm_id", "network_id"}))
public class VmNetworkLink {
    @Id @Column(length = 36) private String id;
    @Column(name = "vm_id", nullable = false, length = 36) private String vmId;
    @Column(name = "network_id", nullable = false, length = 36) private String networkId;
    protected VmNetworkLink() {}
    public VmNetworkLink(String vmId, String networkId) {
        this.id = java.util.UUID.randomUUID().toString(); this.vmId = vmId; this.networkId = networkId;
    }
    public String getNetworkId() { return networkId; }
}
