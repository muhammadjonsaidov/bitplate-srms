package com.biteplate.domain.notification;

import com.biteplate.domain.order.Order;
import com.biteplate.domain.order.OrderStatus;
import com.biteplate.infrastructure.redis.RedisNotificationPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * OBSERVER PATTERN — ConcreteObserver.
 * Pushes all order status events to the manager dashboard channel.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class ManagerDashboard implements OrderObserver {

    private final RedisNotificationPublisher publisher;

    @Override
    public void onOrderStatusChanged(Order order, OrderStatus newStatus) {
        String message = String.format(
            "ORDER UPDATE: #%d | Table %d | Status: %s",
            order.getId(), order.getTable().getTableNumber(), newStatus
        );
        publisher.publish("notifications:manager", message);
        log.debug("Manager dashboard updated for order #{}", order.getId());
    }
}
