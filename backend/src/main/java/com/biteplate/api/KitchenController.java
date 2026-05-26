package com.biteplate.api;

import com.biteplate.application.KitchenService;
import com.biteplate.domain.order.Order;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "Kitchen")
@RestController
@RequestMapping("/api/kitchen")
@RequiredArgsConstructor
public class KitchenController {

    private final KitchenService kitchenService;

    @Operation(summary = "View active kitchen queue (PENDING + PREPARING orders)")
    @GetMapping("/queue")
    public ResponseEntity<List<Order>> getQueue() {
        return ResponseEntity.ok(kitchenService.getQueue());
    }

    @Operation(summary = "COMMAND: Prepare order — PENDING → PREPARING")
    @PutMapping("/orders/{id}/prepare")
    public ResponseEntity<Order> prepareOrder(@PathVariable Long id) {
        return ResponseEntity.ok(kitchenService.prepareOrder(id));
    }

    @Operation(summary = "COMMAND: Mark order ready — PREPARING → READY (notifies waiter)")
    @PutMapping("/orders/{id}/ready")
    public ResponseEntity<Order> markReady(@PathVariable Long id) {
        return ResponseEntity.ok(kitchenService.markReady(id));
    }

    @Operation(summary = "COMMAND: Cancel order")
    @PutMapping("/orders/{id}/cancel")
    public ResponseEntity<Order> cancelOrder(@PathVariable Long id) {
        return ResponseEntity.ok(kitchenService.cancelOrder(id));
    }

    @Operation(summary = "COMMAND PATTERN: Undo last kitchen action")
    @PostMapping("/undo")
    public ResponseEntity<Map<String, String>> undoLast() {
        String result = kitchenService.undoLastAction()
            .orElse("Nothing to undo");
        return ResponseEntity.ok(Map.of("message", result));
    }

    @Operation(summary = "Mark order as served")
    @PutMapping("/orders/{id}/served")
    public ResponseEntity<Order> markServed(@PathVariable Long id) {
        return ResponseEntity.ok(kitchenService.markServed(id));
    }
}
