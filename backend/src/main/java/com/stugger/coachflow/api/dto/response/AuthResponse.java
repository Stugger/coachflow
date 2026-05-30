package com.stugger.coachflow.api.dto.response;

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