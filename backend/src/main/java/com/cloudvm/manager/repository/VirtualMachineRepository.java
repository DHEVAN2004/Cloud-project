package com.cloudvm.manager.repository;

import com.cloudvm.manager.entity.VirtualMachine;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VirtualMachineRepository extends JpaRepository<VirtualMachine, String> {
    List<VirtualMachine> findByOwnerIdOrderByCreatedAtDesc(String ownerId);
    List<VirtualMachine> findByOwnerIdIsNullOrderByCreatedAtDesc();
    Optional<VirtualMachine> findByIdAndOwnerId(String id, String ownerId);
}
