package com.biteplate.domain.notification;

import com.biteplate.domain.order.Order;
import com.biteplate.domain.order.OrderStatus;
import com.biteplate.infrastructure.redis.RedisNotificationPublisher;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

/**
 * OBSERVER PATTERN — ConcreteObserver.
 *
 * Notifies the relevant waiter when an order is READY.
 * Uses Redis Pub/Sub to broadcast the notification.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class WaiterNotifier implements OrderObserver {

    private final RedisNotificationPublisher publisher;

    @Override
    public void onOrderStatusChanged(Order order, OrderStatus newStatus) {
        if (newStatus == OrderStatus.READY) {
            String message = String.format(
                "ORDER READY: Table %d (Order #%d) — please collect from kitchen",
                order.getTable().getTableNumber(), order.getId()
            );
            publisher.publish("notifications:waiter:" + order.getStaff().getId(), message);
            log.info("Waiter {} notified: order #{} ready", order.getStaff().getUsername(), order.getId());
        }
    }
}
