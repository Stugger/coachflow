package com.stugger.coachflow.validation;

import jakarta.validation.ConstraintValidator;
import jakarta.validation.ConstraintValidatorContext;

import java.nio.charset.StandardCharsets;

/**
 * @author Jake
 * @since June 27th, 2026
 */
public class PasswordValidator implements ConstraintValidator<ValidPassword, String> {

    public static final int MIN_CHARACTERS = 12;
    public static final int MAX_CHARACTERS = 64;
    public static final int MAX_UTF8_BYTES = 72;

    @Override
    public boolean isValid(String password, ConstraintValidatorContext context) {
        if (password == null || password.isBlank()) {
            return true;
        }

        int characterCount = password.codePointCount(0, password.length());
        int byteCount = password.getBytes(StandardCharsets.UTF_8).length;

        return characterCount >= MIN_CHARACTERS
                && characterCount <= MAX_CHARACTERS
                && byteCount <= MAX_UTF8_BYTES;
    }
}