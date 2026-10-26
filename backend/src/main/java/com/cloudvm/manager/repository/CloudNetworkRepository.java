package com.cloudvm.manager.repository;

import com.cloudvm.manager.entity.CloudNetwork;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CloudNetworkRepository extends JpaRepository<CloudNetwork, String> {
    List<CloudNetwork> findByOwnerIdOrderByNameAsc(String ownerId);
    List<CloudNetwork> findByOwnerIdIsNullOrderByNameAsc();
    Optional<CloudNetwork> findByIdAndOwnerId(String id, String ownerId);
}
