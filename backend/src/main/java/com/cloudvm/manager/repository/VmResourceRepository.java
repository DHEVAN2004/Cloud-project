package com.cloudvm.manager.repository;

import com.cloudvm.manager.entity.VmResource;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VmResourceRepository extends JpaRepository<VmResource, String> {
    List<VmResource> findByVmIdOrderByRecordedAtDesc(String vmId);
    List<VmResource> findByVmIdInOrderByRecordedAtDesc(List<String> vmIds);
    Optional<VmResource> findByIdAndVmId(String id, String vmId);
}
