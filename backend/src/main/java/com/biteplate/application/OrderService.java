package com.biteplate.application;

import com.biteplate.domain.menu.MenuItem;
import com.biteplate.domain.notification.KitchenDisplayObserver;
import com.biteplate.domain.notification.ManagerDashboard;
import com.biteplate.domain.notification.WaiterNotifier;
import com.biteplate.domain.order.Order;
import com.biteplate.domain.order.OrderItem;
import com.biteplate.domain.order.OrderStatus;
import com.biteplate.domain.staff.Staff;
import com.biteplate.domain.table.RestaurantTable;
import com.biteplate.infrastructure.persistence.OrderRepository;
import com.biteplate.infrastructure.persistence.StaffRepository;
import com.biteplate.infrastructure.persistence.TableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class OrderService {

    private final OrderRepository orderRepository;
    private final TableRepository tableRepository;
    private final StaffRepository staffRepository;
    private final MenuService menuService;
    private final WaiterNotifier waiterNotifier;
    private final ManagerDashboard managerDashboard;
    private final KitchenDisplayObserver kitchenDisplayObserver;

    @Transactional
    public Order createOrder(Long tableId) {
        RestaurantTable table = tableRepository.findById(tableId)
            .orElseThrow(() -> new IllegalArgumentException("Table not found: " + tableId));

        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Staff staff = staffRepository.findByUsername(username)
            .orElseThrow(() -> new IllegalArgumentException("Staff not found"));

        Order order = new Order(table, staff);
        // OBSERVER PATTERN — register observers on new order
        order.addObserver(waiterNotifier);
        order.addObserver(managerDashboard);
        order.addObserver(kitchenDisplayObserver);

        return orderRepository.save(order);
    }

    @Transactional
    public Order addItem(Long orderId, Long menuItemId, int quantity, String customisations) {
        Order order = findById(orderId);
        MenuItem menuItem = menuService.findById(menuItemId);

        if (!menuItem.isAvailable()) throw new IllegalStateException("Menu item not available: " + menuItem.getName());
        if (quantity <= 0) throw new IllegalArgumentException("Quantity must be positive");

        OrderItem item = new OrderItem(order, menuItem, quantity, customisations);

        // Flag allergens automatically
        if (menuItem.getAllergens() != null && !menuItem.getAllergens().isBlank()) {
            item.setAllergenFlagged(true);
        }

        order.addItem(item);
        return orderRepository.save(order);
    }

    @Transactional
    public Order removeItem(Long orderId, Long itemId) {
        Order order = findById(orderId);
        order.getItems().removeIf(i -> i.getId().equals(itemId));
        return orderRepository.save(order);
    }

    @Transactional
    public Order submit(Long orderId) {
        Order order = findById(orderId);
        if (order.getItems().isEmpty()) throw new IllegalStateException("Cannot submit empty order");
        order.updateStatus(OrderStatus.PENDING);
        return orderRepository.save(order);
    }

    public Order findById(Long id) {
        return orderRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Order not found: " + id));
    }

    public List<Order> findActive() {
        return orderRepository.findActiveOrders();
    }

    public List<Order> findByTable(Long tableId) {
        return orderRepository.findByTableId(tableId);
    }

    public List<Order> findByStatus(OrderStatus status) {
        return orderRepository.findByStatus(status);
    }
}
