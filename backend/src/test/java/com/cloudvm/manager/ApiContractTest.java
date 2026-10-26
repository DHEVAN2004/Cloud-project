package com.cloudvm.manager;

import static org.junit.jupiter.api.Assertions.*;
import com.cloudvm.manager.dto.ApiDtos.RegisterRequest;
import com.cloudvm.manager.dto.ApiDtos.VmRequest;
import com.cloudvm.manager.dto.ApiDtos.MetricDto;
import com.cloudvm.manager.entity.VmResource;
import com.cloudvm.manager.service.DtoMapper;
import org.junit.jupiter.api.Test;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import jakarta.validation.Validation;
import com.fasterxml.jackson.databind.ObjectMapper;

class ApiContractTest {
    @Test
    void bcryptStoresOnlyNonReversibleHash() {
        var encoder = new BCryptPasswordEncoder();
        var hash = encoder.encode("a-test-password-never-used-for-login");
        assertNotEquals("a-test-password-never-used-for-login", hash);
        assertTrue(encoder.matches("a-test-password-never-used-for-login", hash));
    }

    @Test
    void vmRequestRejectsNonPositiveCpuAndStorage() {
        var validator = Validation.buildDefaultValidatorFactory().getValidator();
        var invalid = new VmRequest("bad", null, "Linux", 0, 4, 0, "NAT", false, false, null, null);
        assertTrue(validator.validate(invalid).stream().anyMatch(v -> v.getPropertyPath().toString().equals("cpuCores")));
        assertTrue(validator.validate(invalid).stream().anyMatch(v -> v.getPropertyPath().toString().equals("storageGb")));
    }

    @Test
    void vmResourceMapsToRequestedMetricsContract() {
        var dto = DtoMapper.metric(new VmResource("vm-id", 41, 52, 19, 8));
        assertEquals("vm-id", dto.vmId());
        assertNotNull(dto.recordedAt());
        assertEquals(41, dto.cpuUsagePercent());
        assertEquals(52, dto.memoryUsagePercent());
        assertEquals(19, dto.storageUsagePercent());
        assertEquals(8, dto.networkUsagePercent());
    }

    @Test
    void registrationAcceptsUsernameAndLegacyName() throws Exception {
        var mapper = new ObjectMapper();
        var byName = mapper.readValue("{\"name\":\"cloud-user\",\"email\":\"u@example.test\",\"password\":\"long-enough-password\"}", RegisterRequest.class);
        var byUsername = mapper.readValue("{\"username\":\"legacy-user\",\"email\":\"v@example.test\",\"password\":\"long-enough-password\"}", RegisterRequest.class);
        assertEquals("cloud-user", byName.name());
        assertEquals("legacy-user", byUsername.name());
    }
}
