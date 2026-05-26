package com.biteplate.infrastructure.redis;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

/**
 * OBSERVER PATTERN — Redis Pub/Sub transport layer.
 * Publishes notification messages to named Redis channels.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RedisNotificationPublisher {

    private final RedisTemplate<String, Object> redisTemplate;

    public void publish(String channel, String message) {
        try {
            redisTemplate.convertAndSend(channel, message);
        } catch (Exception e) {
            log.warn("Redis publish failed on channel {}: {}", channel, e.getMessage());
        }
    }
}
