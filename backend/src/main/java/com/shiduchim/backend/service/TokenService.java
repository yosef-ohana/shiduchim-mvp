package com.shiduchim.backend.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;

/**
 * Stateless token service using HMAC-SHA256 with standard JDK crypto.
 * Token format: Base64Url(userId.expiryEpochSeconds).Base64Url(signature)
 * No external JWT library required.
 */
@Service
public class TokenService {

    private static final String HMAC_ALGORITHM = "HmacSHA256";
    private static final String SEPARATOR = ".";

    @Value("${app.auth.token-secret}")
    private String tokenSecret;

    @Value("${app.auth.token-expiration-days}")
    private int tokenExpirationDays;

    /**
     * Generate a signed token for the given userId.
     */
    public String generateToken(Long userId) {
        long expiryEpoch = Instant.now().plusSeconds((long) tokenExpirationDays * 24 * 3600).getEpochSecond();
        String payload = userId + ":" + expiryEpoch;
        String payloadEncoded = base64UrlEncode(payload);
        String signature = sign(payloadEncoded);
        return payloadEncoded + SEPARATOR + signature;
    }

    /**
     * Validate the token and return the userId, or null if invalid/expired.
     */
    public Long validateTokenAndGetUserId(String token) {
        if (token == null || token.isBlank()) {
            return null;
        }
        int dotIndex = token.lastIndexOf(SEPARATOR);
        if (dotIndex < 0) {
            return null;
        }
        String payloadEncoded = token.substring(0, dotIndex);
        String providedSignature = token.substring(dotIndex + 1);

        // Verify signature
        String expectedSignature = sign(payloadEncoded);
        if (!constantTimeEquals(expectedSignature, providedSignature)) {
            return null;
        }

        // Decode payload and check expiry
        String payload = base64UrlDecode(payloadEncoded);
        String[] parts = payload.split(":");
        if (parts.length != 2) {
            return null;
        }
        try {
            Long userId = Long.parseLong(parts[0]);
            long expiryEpoch = Long.parseLong(parts[1]);
            if (Instant.now().getEpochSecond() > expiryEpoch) {
                return null; // expired
            }
            return userId;
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private String sign(String data) {
        try {
            Mac mac = Mac.getInstance(HMAC_ALGORITHM);
            SecretKeySpec keySpec = new SecretKeySpec(tokenSecret.getBytes(StandardCharsets.UTF_8), HMAC_ALGORITHM);
            mac.init(keySpec);
            byte[] hmac = mac.doFinal(data.getBytes(StandardCharsets.UTF_8));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(hmac);
        } catch (Exception e) {
            throw new RuntimeException("Failed to sign token", e);
        }
    }

    private String base64UrlEncode(String value) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(value.getBytes(StandardCharsets.UTF_8));
    }

    private String base64UrlDecode(String encoded) {
        byte[] bytes = Base64.getUrlDecoder().decode(encoded);
        return new String(bytes, StandardCharsets.UTF_8);
    }

    /**
     * Constant-time string comparison to prevent timing attacks.
     */
    private boolean constantTimeEquals(String a, String b) {
        if (a.length() != b.length()) return false;
        int result = 0;
        for (int i = 0; i < a.length(); i++) {
            result |= a.charAt(i) ^ b.charAt(i);
        }
        return result == 0;
    }
}
