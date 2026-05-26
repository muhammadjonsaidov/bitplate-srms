package com.biteplate.infrastructure.redis;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.util.List;

/**
 * COMMAND PATTERN — Redis-backed command persistence.
 * Stores kitchen command descriptions in a Redis List so queue survives restarts.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class KitchenQueueRedisAdapter {

    private static final String KITCHEN_QUEUE_KEY = "kitchen:queue";
    private final RedisTemplate<String, Object> redisTemplate;

    public void pushCommand(String commandDescription) {
        try {
            redisTemplate.opsForList().leftPush(KITCHEN_QUEUE_KEY, commandDescription);
        } catch (Exception e) {
            log.warn("Redis kitchen queue push failed: {}", e.getMessage());
        }
    }

    public void popCommand() {
        try {
            redisTemplate.opsForList().rightPop(KITCHEN_QUEUE_KEY);
        } catch (Exception e) {
            log.warn("Redis kitchen queue pop failed: {}", e.getMessage());
        }
    }

    public List<Object> getQueueSnapshot() {
        try {
            return redisTemplate.opsForList().range(KITCHEN_QUEUE_KEY, 0, -1);
        } catch (Exception e) {
            log.warn("Redis kitchen queue read failed: {}", e.getMessage());
            return List.of();
        }
    }
}
