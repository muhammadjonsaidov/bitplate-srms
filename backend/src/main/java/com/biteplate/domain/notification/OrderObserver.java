package com.biteplate.domain.notification;

import com.biteplate.domain.order.Order;
import com.biteplate.domain.order.OrderStatus;

/**
 * OBSERVER PATTERN — Observer interface.
 *
 * Any class that wants to be notified of order status changes implements this.
 * New observers (e.g. WhatsApp notifier, loyalty system) can be added
 * without changing Order or any existing observer.
 */
public interface OrderObserver {
    void onOrderStatusChanged(Order order, OrderStatus newStatus);
}
