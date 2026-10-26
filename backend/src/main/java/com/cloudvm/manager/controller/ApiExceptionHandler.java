package com.cloudvm.manager.controller;

import com.cloudvm.manager.dto.ApiDtos.ApiError;
import com.cloudvm.manager.service.ApiException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import java.time.Instant;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class ApiExceptionHandler {
    @ExceptionHandler(ApiException.class)
    ResponseEntity<ApiError> api(ApiException e, HttpServletRequest request) { return response(e.getStatus(), e.getMessage(), request, null); }
    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<ApiError> validation(MethodArgumentNotValidException e, HttpServletRequest request) {
        Map<String, String> fields = e.getBindingResult().getFieldErrors().stream().collect(Collectors.toMap(
            FieldError::getField, err -> err.getDefaultMessage() == null ? "Invalid value" : err.getDefaultMessage(), (a, b) -> a));
        return response(HttpStatus.BAD_REQUEST, "Request validation failed", request, fields);
    }
    @ExceptionHandler({ConstraintViolationException.class, HttpMessageNotReadableException.class})
    ResponseEntity<ApiError> malformed(Exception e, HttpServletRequest request) { return response(HttpStatus.BAD_REQUEST, "Malformed or invalid request", request, null); }
    @ExceptionHandler(DataIntegrityViolationException.class)
    ResponseEntity<ApiError> conflict(DataIntegrityViolationException e, HttpServletRequest request) { return response(HttpStatus.CONFLICT, "The request conflicts with existing data", request, null); }
    @ExceptionHandler(Exception.class)
    ResponseEntity<ApiError> unexpected(Exception e, HttpServletRequest request) { return response(HttpStatus.INTERNAL_SERVER_ERROR, "An unexpected server error occurred", request, null); }
    private ResponseEntity<ApiError> response(HttpStatus status, String message, HttpServletRequest request, Object details) {
        return ResponseEntity.status(status).body(new ApiError(Instant.now(), status.value(), status.getReasonPhrase(), message, request.getRequestURI(), details));
    }
}
