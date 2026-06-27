package com.stugger.coachflow.config;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.validation.annotation.Validated;

import java.time.Duration;

/**
 * @author Jake
 * @since June 26th, 2026
 */
@Validated
@ConfigurationProperties(prefix = "coachflow.jwt")
public record JwtProperties(

        @NotBlank
        String issuer,

        @NotBlank
        String secret,

        @NotNull
        Duration accessTokenTtl
) {
}