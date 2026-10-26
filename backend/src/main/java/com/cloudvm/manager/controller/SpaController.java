package com.cloudvm.manager.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class SpaController {
    @GetMapping({
        "/", "/login", "/dashboard", "/virtual-machines",
        "/virtual-machines/{id}", "/virtual-machines/{id}/edit", "/virtual-machines/{id}/console",
        "/create-vm", "/monitoring", "/alerts", "/system-resources", "/network-topology", "/settings"
    })
    public String forwardToFrontend() {
        return "forward:/index.html";
    }
}
