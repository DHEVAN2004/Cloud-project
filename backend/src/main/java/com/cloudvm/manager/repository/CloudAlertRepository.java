package com.cloudvm.manager.repository;

import com.cloudvm.manager.entity.CloudAlert;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CloudAlertRepository extends JpaRepository<CloudAlert, String> {
    List<CloudAlert> findByOwnerIdOrderByCreatedAtDesc(String ownerId);
    List<CloudAlert> findByOwnerIdIsNullOrderByCreatedAtDesc();
    Optional<CloudAlert> findByIdAndOwnerId(String id, String ownerId);
}
