package com.cloudvm.manager.service;

import com.cloudvm.manager.dto.ApiDtos.*;
import com.cloudvm.manager.entity.CloudAlert;
import com.cloudvm.manager.entity.AppSetting;
import com.cloudvm.manager.repository.CloudAlertRepository;
import com.cloudvm.manager.repository.AppSettingRepository;
import java.util.ArrayList;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class WorkspaceService {
    private final CloudAlertRepository alerts;
    private final AppSettingRepository settings;
    public WorkspaceService(CloudAlertRepository alerts, AppSettingRepository settings) { this.alerts = alerts; this.settings = settings; }
    @Transactional(readOnly = true)
    public List<AlertDto> alerts(String owner) {
        List<CloudAlert> rows = new ArrayList<>(alerts.findByOwnerIdIsNullOrderByCreatedAtDesc());
        rows.addAll(alerts.findByOwnerIdOrderByCreatedAtDesc(owner));
        return rows.stream().map(DtoMapper::alert).toList();
    }
    @Transactional
    public AlertDto status(String id, String status, String owner) {
        CloudAlert a = alerts.findByIdAndOwnerId(id, owner).orElseGet(() -> alerts.findById(id)
            .filter(x -> x.getOwnerId() == null).orElseThrow(() -> ApiException.notFound("Alert")));
        if (a.getOwnerId() == null) throw new ApiException(HttpStatus.FORBIDDEN, "Seeded shared alerts are read-only");
        a.setStatus(status); return DtoMapper.alert(a);
    }
    @Transactional(readOnly = true)
    public SettingsDto getSettings(String owner) {
        List<AppSetting> rows = settings.findByUserId(owner);
        if (rows.isEmpty()) throw ApiException.notFound("Settings");
        return toDto(rows);
    }
    @Transactional
    public SettingsDto putSettings(String owner, SettingsRequest r) {
        put(owner, "region", r.region());
        put(owner, "refreshInterval", Integer.toString(r.refreshInterval()));
        put(owner, "emailAlerts", Boolean.toString(r.emailAlerts()));
        put(owner, "criticalOnly", Boolean.toString(r.criticalOnly()));
        put(owner, "maintenanceNotices", Boolean.toString(r.maintenanceNotices()));
        return toDto(settings.findByUserId(owner));
    }
    private void put(String owner, String key, String value) {
        AppSetting setting = settings.findByUserIdAndKey(owner, key).orElseGet(() -> new AppSetting(owner, key, value));
        setting.setValue(value);
        settings.save(setting);
    }
    private SettingsDto toDto(List<AppSetting> rows) {
        var values = rows.stream().collect(java.util.stream.Collectors.toMap(AppSetting::getKey, AppSetting::getValue));
        return new SettingsDto(values.getOrDefault("region", "us-east"),
            Integer.parseInt(values.getOrDefault("refreshInterval", "60")),
            Boolean.parseBoolean(values.getOrDefault("emailAlerts", "true")),
            Boolean.parseBoolean(values.getOrDefault("criticalOnly", "false")),
            Boolean.parseBoolean(values.getOrDefault("maintenanceNotices", "true")));
    }
}
