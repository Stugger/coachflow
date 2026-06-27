package com.stugger.coachflow.validation;

import jakarta.validation.Constraint;
import jakarta.validation.Payload;

import java.lang.annotation.Documented;
import java.lang.annotation.ElementType;
import java.lang.annotation.Retention;
import java.lang.annotation.RetentionPolicy;
import java.lang.annotation.Target;

/**
 * @author Jake
 * @since June 27th, 2026
 */
@Documented
@Constraint(validatedBy = PasswordValidator.class)
@Target({
        ElementType.FIELD,
        ElementType.PARAMETER,
        ElementType.RECORD_COMPONENT
})
@Retention(RetentionPolicy.RUNTIME)
public @interface ValidPassword {

    String message() default "Password must be at least " + PasswordValidator.MIN_CHARACTERS + " characters and no more than " + PasswordValidator.MAX_CHARACTERS + " characters.";

    Class<?>[] groups() default {};

    Class<? extends Payload>[] payload() default {};
}