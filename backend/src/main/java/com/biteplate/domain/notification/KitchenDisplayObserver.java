package com.biteplate.domain.notification;

import com.biteplate.domain.order.Order;
import com.biteplate.domain.order.OrderStatus;
import com.biteplate.infrastructure.redis.RedisNotificationPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * OBSERVER PATTERN — ConcreteObserver.
 * Updates kitchen display when orders change status (PREPARING, CANCELLED).
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class KitchenDisplayObserver implements OrderObserver {

    private final RedisNotificationPublisher publisher;

    @Override
    public void onOrderStatusChanged(Order order, OrderStatus newStatus) {
        if (newStatus == OrderStatus.PREPARING || newStatus == OrderStatus.CANCELLED) {
            String message = String.format(
                "KITCHEN: Order #%d | Table %d | %s",
                order.getId(), order.getTable().getTableNumber(), newStatus
            );
            publisher.publish("notifications:kitchen", message);
        }
    }
}
