package com.stugger.coachflow.api.dto.response.person;

import com.stugger.coachflow.entity.person.User;
import com.stugger.coachflow.entity.person.UserRole;

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