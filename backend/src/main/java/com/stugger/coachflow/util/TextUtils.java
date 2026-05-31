package com.stugger.coachflow.util;

import java.util.Arrays;
import java.util.stream.Collectors;

/**
 * @author Jake
 * @since May 31st, 2026
 */
public final class TextUtils {

    private TextUtils() {
    }

    public static String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    public static String trimToEmpty(String value) {
        if (value == null) {
            return "";
        }
        return value.trim();
    }

    public static String normalizeName(String value) {
        String trimmed = trimToNull(value);
        if (trimmed == null) {
            return null;
        }
        return Arrays.stream(trimmed.toLowerCase().split("\\s+"))
                .map(TextUtils::capitalizeFirst)
                .collect(Collectors.joining(" "));
    }

    public static String normalizeEmail(String value) {
        String trimmed = trimToNull(value);
        if (trimmed == null) {
            return null;
        }
        return trimmed.toLowerCase();
    }

    private static String capitalizeFirst(String value) {
        if (value.isEmpty()) {
            return value;
        }
        return Character.toUpperCase(value.charAt(0)) + value.substring(1);
    }
}