package com.biteplate.domain.kitchen;

import com.biteplate.infrastructure.redis.KitchenQueueRedisAdapter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.util.ArrayDeque;
import java.util.Deque;
import java.util.Optional;

/**
 * COMMAND PATTERN — Invoker.
 *
 * Receives and executes KitchenCommand objects.
 * Maintains a history deque for undo support.
 * Also persists active commands to Redis for durability across restarts.
 *
 * Separation of concerns:
 * - KitchenQueue only knows about KitchenCommand (not Order directly)
 * - Commands encapsulate all knowledge needed to execute/undo themselves
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class KitchenQueue {

    private final KitchenQueueRedisAdapter redisAdapter;

    /** In-memory command history for undo support */
    private final Deque<KitchenCommand> commandHistory = new ArrayDeque<>();

    /**
     * Execute a command and store it in history.
     */
    public void execute(KitchenCommand command) {
        command.execute();
        commandHistory.push(command);
        redisAdapter.pushCommand(command.getDescription());
        log.info("Kitchen command executed: {}", command.getDescription());
    }

    /**
     * Undo the most recent command.
     */
    public Optional<String> undoLast() {
        if (commandHistory.isEmpty()) {
            return Optional.empty();
        }
        KitchenCommand last = commandHistory.pop();
        last.undo();
        redisAdapter.popCommand();
        log.info("Kitchen command undone: {}", last.getDescription());
        return Optional.of("Undone: " + last.getDescription());
    }

    public boolean hasCommands() {
        return !commandHistory.isEmpty();
    }

    public int queueSize() {
        return commandHistory.size();
    }
}
