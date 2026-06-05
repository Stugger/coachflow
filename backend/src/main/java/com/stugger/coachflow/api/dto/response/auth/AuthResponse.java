package com.stugger.coachflow.api.dto.response.auth;

import com.stugger.coachflow.api.dto.response.person.TrainerResponse;
import com.stugger.coachflow.api.dto.response.person.UserResponse;

/**
 * @author Jake
 * @since May 29th, 2026
 */
public record AuthResponse(
        UserResponse user,
        TrainerResponse trainer,
        String token
) {
}