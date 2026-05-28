package com.stugger.coachflow.api.dto.response;

import com.stugger.coachflow.entity.User;
import com.stugger.coachflow.entity.UserRole;

/**
 * @author Jake
 * @since May 27th, 2026
 */
public record UserResponse(
        Long id,
        String email,
        UserRole role
) {
    public UserResponse(User user) {
        this(user.getId(),
            user.getEmail(),
            user.getRole()
        );
    }
}