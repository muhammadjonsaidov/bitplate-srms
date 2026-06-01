package com.biteplate.api;

import com.biteplate.application.OrderService;
import com.biteplate.domain.order.Order;
import com.biteplate.domain.order.OrderStatus;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Orders")
@RestController
@RequestMapping("/api/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    public record CreateOrderRequest(@NotNull Long tableId) {}
    public record AddItemRequest(@NotNull Long menuItemId, @Min(1) int quantity, String customisations) {}

    @Operation(summary = "Create a new order for a table")
    @PostMapping
    public ResponseEntity<Order> createOrder(@Valid @RequestBody CreateOrderRequest request) {
        return ResponseEntity.status(201).body(orderService.createOrder(request.tableId()));
    }

    @Operation(summary = "Add menu item to order")
    @PostMapping("/{orderId}/items")
    public ResponseEntity<Order> addItem(
        @PathVariable Long orderId,
        @Valid @RequestBody AddItemRequest request
    ) {
        return ResponseEntity.ok(orderService.addItem(
            orderId, request.menuItemId(), request.quantity(), request.customisations()
        ));
    }

    @Operation(summary = "Remove item from order (only when PENDING)")
    @DeleteMapping("/{orderId}/items/{itemId}")
    @PreAuthorize("hasAnyRole('WAITER','MANAGER')")
    public ResponseEntity<Order> removeItem(@PathVariable Long orderId, @PathVariable Long itemId) {
        return ResponseEntity.ok(orderService.removeItem(orderId, itemId));
    }

    @Operation(summary = "Submit order to kitchen queue")
    @PutMapping("/{orderId}/submit")
    public ResponseEntity<Order> submitOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(orderService.submit(orderId));
    }

    @Operation(summary = "Get order by ID")
    @GetMapping("/{id}")
    public ResponseEntity<Order> getOrder(@PathVariable Long id) {
        return ResponseEntity.ok(orderService.findById(id));
    }

    @Operation(summary = "Get all active orders")
    @GetMapping("/active")
    public ResponseEntity<List<Order>> getActiveOrders() {
        return ResponseEntity.ok(orderService.findActive());
    }

    @Operation(summary = "Get orders for a specific table")
    @GetMapping("/table/{tableId}")
    public ResponseEntity<List<Order>> getOrdersByTable(@PathVariable Long tableId) {
        return ResponseEntity.ok(orderService.findByTable(tableId));
    }

    @Operation(summary = "Get orders by status")
    @GetMapping
    public ResponseEntity<List<Order>> getOrders(@RequestParam(required = false) OrderStatus status) {
        if (status != null) return ResponseEntity.ok(orderService.findByStatus(status));
        return ResponseEntity.ok(orderService.findActive());
    }
}
