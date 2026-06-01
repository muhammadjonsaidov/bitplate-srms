package com.biteplate.application;

import com.biteplate.domain.kitchen.*;
import com.biteplate.domain.notification.KitchenDisplayObserver;
import com.biteplate.domain.notification.ManagerDashboard;
import com.biteplate.domain.notification.WaiterNotifier;
import com.biteplate.domain.order.Order;
import com.biteplate.domain.order.OrderStatus;
import com.biteplate.infrastructure.persistence.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class KitchenService {

    private final OrderRepository orderRepository;
    private final KitchenQueue kitchenQueue;

    private final WaiterNotifier waiterNotifier;
    private final ManagerDashboard managerDashboard;
    private final KitchenDisplayObserver kitchenDisplayObserver;

    @Transactional(readOnly = true)
    public List<Order> getQueue() {
        return orderRepository.findActiveOrders();
    }

    @Transactional
    public Order prepareOrder(Long orderId) {
        Order order = loadWithObservers(orderId);
        kitchenQueue.execute(new PrepareOrderCommand(order));
        return orderRepository.save(order);
    }

    @Transactional
    public Order markReady(Long orderId) {
        Order order = loadWithObservers(orderId);
        kitchenQueue.execute(new ExpediteOrderCommand(order));
        return orderRepository.save(order);
    }

    @Transactional
    public Order cancelOrder(Long orderId) {
        Order order = loadWithObservers(orderId);
        kitchenQueue.execute(new CancelOrderCommand(order));
        return orderRepository.save(order);
    }

    @Transactional
    public Optional<String> undoLastAction() {
        return kitchenQueue.undoLastWithReload(orderRepository);
    }

    @Transactional
    public Order markServed(Long orderId) {
        Order order = loadWithObservers(orderId);
        kitchenQueue.execute(new ServeOrderCommand(order));
        return orderRepository.save(order);
    }

    /**
     * Loads an order from the database and re-registers observers.
     * Observers are @Transient and not persisted, so they must be re-attached
     * each time an order is loaded for status updates.
     */
    private Order loadWithObservers(Long id) {
        Order order = orderRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Order not found: " + id));
        order.addObserver(waiterNotifier);
        order.addObserver(managerDashboard);
        order.addObserver(kitchenDisplayObserver);
        return order;
    }
}
