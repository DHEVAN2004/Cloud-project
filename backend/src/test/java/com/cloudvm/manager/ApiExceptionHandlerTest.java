package com.cloudvm.manager;

import static org.hamcrest.Matchers.containsString;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.content;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.cloudvm.manager.controller.ApiExceptionHandler;
import org.junit.jupiter.api.Test;
import org.springframework.dao.DataAccessResourceFailureException;
import org.springframework.stereotype.Controller;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;

class ApiExceptionHandlerTest {
    private final MockMvc mvc = MockMvcBuilders.standaloneSetup(new DatabaseFailureController())
        .setControllerAdvice(new ApiExceptionHandler())
        .build();

    @Test
    void reportsDatabaseFailuresAsServiceUnavailableWithoutSuccessFallback() throws Exception {
        mvc.perform(get("/database-failure"))
            .andExpect(status().isServiceUnavailable())
            .andExpect(content().string(containsString("The database is unavailable; the request was not completed")));
    }

    @Controller
    static class DatabaseFailureController {
        @GetMapping("/database-failure")
        @ResponseBody
        String fail() {
            throw new DataAccessResourceFailureException("database is offline");
        }
    }
}
