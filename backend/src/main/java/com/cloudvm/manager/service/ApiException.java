package com.cloudvm.manager.service;

import org.springframework.http.HttpStatus;

public class ApiException extends RuntimeException {
    private final HttpStatus status;
    public ApiException(HttpStatus status, String message) { super(message); this.status = status; }
    public HttpStatus getStatus() { return status; }
    public static ApiException notFound(String kind) { return new ApiException(HttpStatus.NOT_FOUND, kind + " not found"); }
    public static ApiException forbidden() { return new ApiException(HttpStatus.FORBIDDEN, "You do not own this resource"); }
    public static ApiException conflict(String message) { return new ApiException(HttpStatus.CONFLICT, message); }
}
