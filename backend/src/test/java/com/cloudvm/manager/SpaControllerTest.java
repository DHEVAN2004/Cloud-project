package com.cloudvm.manager;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.forwardedUrl;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cloudvm.manager.controller.SpaController;
import org.junit.jupiter.api.Test;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class SpaControllerTest {
    private final MockMvc mvc = MockMvcBuilders.standaloneSetup(new SpaController()).build();

    @Test
    void forwardsRootAndNestedClientRoutesToTheReactEntryPoint() throws Exception {
        mvc.perform(get("/"))
            .andExpect(status().isOk())
            .andExpect(forwardedUrl("/index.html"));
        mvc.perform(get("/virtual-machines/123/edit"))
            .andExpect(status().isOk())
            .andExpect(forwardedUrl("/index.html"));
    }

    @Test
    void doesNotForwardUnknownApiRoutesToTheReactEntryPoint() throws Exception {
        mvc.perform(get("/api/unknown"))
            .andExpect(status().isNotFound());
    }
}
