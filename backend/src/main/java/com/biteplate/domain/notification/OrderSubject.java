package com.biteplate.domain.notification;

import com.biteplate.domain.order.OrderStatus;

/**
 * OBSERVER PATTERN — Subject interface.
 * Implemented by Order (ConcreteSubject).
 */
public interface OrderSubject {
    void addObserver(OrderObserver observer);
    void removeObserver(OrderObserver observer);
    void notifyObservers(OrderStatus newStatus);
}
