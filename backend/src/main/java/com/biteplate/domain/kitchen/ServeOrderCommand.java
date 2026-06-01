package com.biteplate.domain.kitchen;

import com.biteplate.domain.order.Order;
import com.biteplate.domain.order.OrderStatus;
import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public class ServeOrderCommand implements KitchenCommand {

    private final Order order;
    private OrderStatus previousStatus;

    @Override
    public void execute() {
        previousStatus = order.getStatus();
        order.updateStatus(OrderStatus.SERVED);
    }

    @Override
    public void undo() {
        if (previousStatus != null) {
            order.updateStatus(previousStatus);
        }
    }

    @Override
    public String getDescription() {
        return "SERVE order #" + order.getId() + " (Table " + order.getTable().getTableNumber() + ")";
    }
}