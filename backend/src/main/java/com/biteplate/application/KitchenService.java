package com.biteplate.application;

import com.biteplate.domain.kitchen.*;
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
    private final KitchenQueue kitchenQueue; // COMMAND PATTERN — invoker

    public List<Order> getQueue() {
        return orderRepository.findActiveOrders();
    }

    /**
     * COMMAND PATTERN — wraps action in PrepareOrderCommand and executes via KitchenQueue.
     */
    @Transactional
    public Order prepareOrder(Long orderId) {
        Order order = findById(orderId);
        kitchenQueue.execute(new PrepareOrderCommand(order));
        return orderRepository.save(order);
    }

    @Transactional
    public Order markReady(Long orderId) {
        Order order = findById(orderId);
        kitchenQueue.execute(new ExpediteOrderCommand(order));
        return orderRepository.save(order);
    }

    @Transactional
    public Order cancelOrder(Long orderId) {
        Order order = findById(orderId);
        kitchenQueue.execute(new CancelOrderCommand(order));
        return orderRepository.save(order);
    }

    /**
     * COMMAND PATTERN — undo support via KitchenQueue history.
     */
    @Transactional
    public Optional<String> undoLastAction() {
        return kitchenQueue.undoLast();
    }

    @Transactional
    public Order markServed(Long orderId) {
        Order order = findById(orderId);
        order.updateStatus(OrderStatus.SERVED);
        return orderRepository.save(order);
    }

    private Order findById(Long id) {
        return orderRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Order not found: " + id));
    }
}
