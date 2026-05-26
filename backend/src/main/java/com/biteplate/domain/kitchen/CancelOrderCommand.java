package com.biteplate.domain.kitchen;

import com.biteplate.domain.order.Order;
import com.biteplate.domain.order.OrderStatus;
import lombok.RequiredArgsConstructor;

/**
 * COMMAND PATTERN — ConcreteCommand.
 *
 * Encapsulates the "cancel an order" kitchen action.
 * undo() restores previous status (if cancellation was a mistake).
 */
@RequiredArgsConstructor
public class CancelOrderCommand implements KitchenCommand {

    private final Order order;
    private OrderStatus previousStatus;

    @Override
    public void execute() {
        if (order.getStatus() == OrderStatus.READY || order.getStatus() == OrderStatus.SERVED) {
            throw new IllegalStateException("Cannot cancel order that is already ready or served");
        }
        previousStatus = order.getStatus();
        order.updateStatus(OrderStatus.CANCELLED);
    }

    @Override
    public void undo() {
        if (previousStatus != null && order.getStatus() == OrderStatus.CANCELLED) {
            order.updateStatus(previousStatus);
        }
    }

    @Override
    public String getDescription() {
        return "CANCEL order #" + order.getId() + " (Table " + order.getTable().getTableNumber() + ")";
    }
}
