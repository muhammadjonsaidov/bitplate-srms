package com.biteplate.domain.kitchen;

import com.biteplate.domain.order.Order;
import com.biteplate.domain.order.OrderStatus;
import lombok.RequiredArgsConstructor;

/**
 * COMMAND PATTERN — ConcreteCommand.
 *
 * Encapsulates the "start preparing an order" action.
 * execute() → sets order to PREPARING.
 * undo()    → reverts to PENDING (only valid before cooking completes).
 */
@RequiredArgsConstructor
public class PrepareOrderCommand implements KitchenCommand {

    private final Order order;
    private OrderStatus previousStatus;

    @Override
    public void execute() {
        previousStatus = order.getStatus();
        order.updateStatus(OrderStatus.PREPARING);
    }

    @Override
    public void undo() {
        if (previousStatus != null) {
            order.updateStatus(previousStatus);
        }
    }

    @Override
    public String getDescription() {
        return "PREPARE order #" + order.getId() + " (Table " + order.getTable().getTableNumber() + ")";
    }
}
