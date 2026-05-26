package com.biteplate.security;

import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.UUID;

/**
 * Stores refresh tokens in Redis with TTL.
 * Key: "refresh:{username}" → refresh token value.
 */
@Service
@RequiredArgsConstructor
public class RefreshTokenService {

    private final RedisTemplate<String, Object> redisTemplate;
    private final JwtTokenProvider tokenProvider;

    @Value("${jwt.refresh-expiration-ms}")
    private long refreshExpirationMs;

    private static final String PREFIX = "refresh:";

    public String createRefreshToken(String username) {
        String token = tokenProvider.generateRefreshToken(username);
        String key = PREFIX + username;
        redisTemplate.opsForValue().set(key, token, Duration.ofMillis(refreshExpirationMs));
        return token;
    }

    public boolean validateRefreshToken(String username, String token) {
        Object stored = redisTemplate.opsForValue().get(PREFIX + username);
        return stored != null && stored.toString().equals(token);
    }

    public void invalidate(String username) {
        redisTemplate.delete(PREFIX + username);
    }
}
