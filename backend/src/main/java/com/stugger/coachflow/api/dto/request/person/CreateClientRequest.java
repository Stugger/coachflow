package com.stugger.coachflow.api.dto.request.person;

import com.stugger.coachflow.entity.person.ClientGender;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDate;

/**
 * @author Jake
 * @since May 27th, 2026
 */
public record CreateClientRequest(
        @NotNull(message = "Trainer is required")
        Long trainerId,

        @NotBlank(message = "First name is required")
        String firstName,

        @NotBlank(message = "Last name is required")
        String lastName,

        String preferredName,

        @Email(message = "Invalid email")
        String email,

        @NotBlank(message = "Phone number is required")
        String phone,

        @NotNull(message = "Birth date is required")
        LocalDate birthDate,

        ClientGender gender
) {
}