package com.stugger.coachflow.service;

import com.stugger.coachflow.entity.User;
import com.stugger.coachflow.entity.UserRole;
import com.stugger.coachflow.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

/**
 * @author Jake
 * @since May 27th, 2026
 */
@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User createUser(String email, String password, UserRole role, LocalDateTime now) {
        User user = new User();
        user.setEmail(email);
        user.setPasswordHash(password); // TODO hash later
        user.setRole(role);
        user.setCreatedAt(now);
        user.setUpdatedAt(now);
        return userRepository.save(user);
    }
}