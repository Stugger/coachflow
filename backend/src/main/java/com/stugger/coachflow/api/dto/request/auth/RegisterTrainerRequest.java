package com.stugger.coachflow.api.dto.request.auth;

import com.stugger.coachflow.validation.ValidPassword;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDate;

/**
 * @author Jake
 * @since May 29th, 2026
 */
public record RegisterTrainerRequest(
        @NotBlank(message="First name is required")
        String firstName,

        @NotBlank(message="Last name is required")
        String lastName,

        LocalDate birthDate,

        @NotBlank(message="Email is required")
        @Email(message="Invalid email")
        String email,

        @NotBlank(message="Password is required")
        @ValidPassword
        String password
) {
}