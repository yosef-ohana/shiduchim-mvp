package com.shiduchim.backend.dto.auth;

import com.shiduchim.backend.enums.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class StaffLoginRequest {

    @NotBlank
    @Email
    private String email;

    @NotBlank
    private String password;

    @NotNull
    private UserRole expectedRole;

    public StaffLoginRequest() {
    }

    public StaffLoginRequest(String email, String password, UserRole expectedRole) {
        this.email = email;
        this.password = password;
        this.expectedRole = expectedRole;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public UserRole getExpectedRole() {
        return expectedRole;
    }

    public void setExpectedRole(UserRole expectedRole) {
        this.expectedRole = expectedRole;
    }
}
