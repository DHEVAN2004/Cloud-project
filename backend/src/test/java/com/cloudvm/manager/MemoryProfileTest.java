package com.cloudvm.manager;

import static org.junit.jupiter.api.Assertions.assertEquals;

import com.cloudvm.manager.repository.AppSettingRepository;
import com.cloudvm.manager.repository.AppUserRepository;
import com.cloudvm.manager.repository.CloudAlertRepository;
import com.cloudvm.manager.repository.CloudNetworkRepository;
import com.cloudvm.manager.repository.VirtualMachineRepository;
import com.cloudvm.manager.repository.VmNetworkLinkRepository;
import com.cloudvm.manager.repository.VmResourceRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;

@SpringBootTest(properties = "app.jwt.secret=MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=")
@ActiveProfiles("memory")
class MemoryProfileTest {
    @Autowired
    private AppUserRepository users;

    @Autowired
    private AppSettingRepository settings;

    @Autowired
    private CloudAlertRepository alerts;

    @Autowired
    private CloudNetworkRepository networks;

    @Autowired
    private VirtualMachineRepository vms;

    @Autowired
    private VmNetworkLinkRepository networkLinks;

    @Autowired
    private VmResourceRepository resources;

    @Test
    void startsWithEmptyTablesForAllApplicationEntities() {
        assertEquals(0, users.count());
        assertEquals(0, settings.count());
        assertEquals(0, alerts.count());
        assertEquals(0, networks.count());
        assertEquals(0, vms.count());
        assertEquals(0, networkLinks.count());
        assertEquals(0, resources.count());
    }
}
