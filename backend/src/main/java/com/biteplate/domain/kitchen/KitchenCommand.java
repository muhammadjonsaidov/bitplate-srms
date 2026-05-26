package com.biteplate.domain.kitchen;

/**
 * COMMAND PATTERN — Command interface.
 *
 * Each kitchen action (Prepare, Cancel, Expedite) is encapsulated as an object.
 * This allows: queuing, logging, undo support, and decoupling invoker from receiver.
 */
public interface KitchenCommand {
    void execute();
    void undo();
    String getDescription();
}
