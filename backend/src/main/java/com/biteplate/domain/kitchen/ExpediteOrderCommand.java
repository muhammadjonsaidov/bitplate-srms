package com.biteplate.domain.kitchen;

import com.biteplate.domain.order.Order;
import com.biteplate.domain.order.OrderStatus;
import lombok.RequiredArgsConstructor;

/**
 * COMMAND PATTERN — ConcreteCommand.
 *
 * Marks an order as READY immediately (expedited by head chef).
 * undo() reverts back to PREPARING.
 */
@RequiredArgsConstructor
public class ExpediteOrderCommand implements KitchenCommand {

    private final Order order;
    private OrderStatus previousStatus;

    @Override
    public void execute() {
        previousStatus = order.getStatus();
        order.updateStatus(OrderStatus.READY);
    }

    @Override
    public void undo() {
        if (previousStatus != null) {
            order.updateStatus(previousStatus);
        }
    }

    @Override
    public String getDescription() {
        return "EXPEDITE order #" + order.getId() + " (Table " + order.getTable().getTableNumber() + ")";
    }
}
