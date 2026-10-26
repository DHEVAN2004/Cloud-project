package com.cloudvm.manager.repository;

import com.cloudvm.manager.entity.VmNetworkLink;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VmNetworkLinkRepository extends JpaRepository<VmNetworkLink, String> {
    boolean existsByVmIdAndNetworkId(String vmId, String networkId);
    List<VmNetworkLink> findByVmId(String vmId);
    long deleteByVmIdAndNetworkId(String vmId, String networkId);
    long deleteByVmId(String vmId);
    long deleteByNetworkId(String networkId);
}
