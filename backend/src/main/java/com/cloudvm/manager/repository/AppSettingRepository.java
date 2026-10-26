package com.cloudvm.manager.repository;

import com.cloudvm.manager.entity.AppSetting;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AppSettingRepository extends JpaRepository<AppSetting, String> {
    List<AppSetting> findByUserId(String userId);
    Optional<AppSetting> findByUserIdAndKey(String userId, String key);
    long deleteByUserId(String userId);
}
