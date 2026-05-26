package com.biteplate.api;

import com.biteplate.application.BillingService;
import com.biteplate.domain.billing.Bill;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.PositiveOrZero;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@Tag(name = "Billing")
@RestController
@RequestMapping("/api/billing")
@RequiredArgsConstructor
public class BillingController {

    private final BillingService billingService;

    @Operation(summary = "FACADE: Generate itemised bill for an order")
    @PostMapping("/generate/{orderId}")
    public ResponseEntity<Bill> generateBill(
        @PathVariable Long orderId,
        @RequestParam(defaultValue = "STANDARD") String strategy
    ) {
        return ResponseEntity.status(201).body(billingService.generateBill(orderId, strategy));
    }

    @Operation(summary = "FACADE: Apply tip to bill")
    @PutMapping("/{billId}/tip")
    public ResponseEntity<Bill> applyTip(
        @PathVariable Long billId,
        @RequestParam @PositiveOrZero BigDecimal tip
    ) {
        return ResponseEntity.ok(billingService.applyTip(billId, tip));
    }

    @Operation(summary = "FACADE: Split bill between guests")
    @PutMapping("/{billId}/split")
    public ResponseEntity<Bill> splitBill(
        @PathVariable Long billId,
        @RequestParam @Min(2) int guests
    ) {
        return ResponseEntity.ok(billingService.splitBill(billId, guests));
    }

    @Operation(summary = "Mark bill as paid and close the order")
    @PutMapping("/{billId}/pay")
    public ResponseEntity<Bill> markPaid(@PathVariable Long billId) {
        return ResponseEntity.ok(billingService.markPaid(billId));
    }

    @Operation(summary = "Get bill for an order")
    @GetMapping("/order/{orderId}")
    public ResponseEntity<Bill> getBillForOrder(@PathVariable Long orderId) {
        return ResponseEntity.ok(billingService.findByOrderId(orderId));
    }
}
