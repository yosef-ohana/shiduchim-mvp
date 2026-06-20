package com.shiduchim.backend.config;

import com.shiduchim.backend.dto.common.ErrorResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.validation.FieldError;

import java.time.Instant;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorResponse> handleResponseStatusException(ResponseStatusException ex, HttpServletRequest request) {
        String message = ex.getReason() != null ? ex.getReason() : ex.getStatusCode().toString();
        ErrorResponse errorResponse = new ErrorResponse(
            message,
            ex.getStatusCode().value(),
            request.getRequestURI(),
            Instant.now()
        );
        return new ResponseEntity<>(errorResponse, ex.getStatusCode());
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException ex, HttpServletRequest request) {
        String message = "Validation error";
        if (ex.getBindingResult().hasErrors() && ex.getBindingResult().getFieldError() != null) {
            FieldError fieldError = ex.getBindingResult().getFieldError();
            message = fieldError.getField() + " " + fieldError.getDefaultMessage();
        }
        ErrorResponse errorResponse = new ErrorResponse(
            message,
            HttpStatus.BAD_REQUEST.value(),
            request.getRequestURI(),
            Instant.now()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleHttpMessageNotReadableException(HttpMessageNotReadableException ex, HttpServletRequest request) {
        String message = "Malformed request body";
        if (ex.getMessage() != null && (ex.getMessage().contains("LocalDate") || ex.getMessage().contains("java.time.LocalDate"))) {
            message = "Invalid date format. Expected YYYY-MM-DD.";
        } else if (ex.getCause() != null && ex.getCause().getMessage() != null && ex.getCause().getMessage().contains("LocalDate")) {
            message = "Invalid date format. Expected YYYY-MM-DD.";
        }

        ErrorResponse errorResponse = new ErrorResponse(
            message,
            HttpStatus.BAD_REQUEST.value(),
            request.getRequestURI(),
            Instant.now()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(IllegalArgumentException ex, HttpServletRequest request) {
        ErrorResponse errorResponse = new ErrorResponse(
            ex.getMessage() != null ? ex.getMessage() : "Invalid argument",
            HttpStatus.BAD_REQUEST.value(),
            request.getRequestURI(),
            Instant.now()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.BAD_REQUEST);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex, HttpServletRequest request) {
        ErrorResponse errorResponse = new ErrorResponse(
            "Server error. Please try again later.",
            HttpStatus.INTERNAL_SERVER_ERROR.value(),
            request.getRequestURI(),
            Instant.now()
        );
        return new ResponseEntity<>(errorResponse, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
