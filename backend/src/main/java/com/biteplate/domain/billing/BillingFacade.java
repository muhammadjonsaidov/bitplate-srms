package com.biteplate.domain.billing;

import com.biteplate.domain.order.Order;
import com.biteplate.domain.order.OrderHistoryLog;
import com.biteplate.domain.order.OrderRecord;
import com.biteplate.domain.pricing.PricingStrategy;
import com.biteplate.infrastructure.persistence.BillRepository;
import com.biteplate.infrastructure.persistence.OrderHistoryLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;

/**
 * FACADE PATTERN — Provides a single, simple interface to the complex billing subsystem.
 *
 * Clients (BillingController, BillingService) call one method.
 * Behind the scenes: TaxCalculator, TipHandler, SplitBillService, OrderHistoryLog all coordinate.
 * No client needs to know about these sub-components.
 *
 * Thread-safe: strategy is passed as a method parameter, not stored as mutable state.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class BillingFacade {

    private final TaxCalculator taxCalculator;
    private final TipHandler tipHandler;
    private final SplitBillService splitBillService;
    private final BillRepository billRepository;
    private final OrderHistoryLogRepository historyRepository;

    /**
     * FACADE — single call to generate a complete, itemised bill.
     * STRATEGY PATTERN — accepts any PricingStrategy implementation.
     * Thread-safe: strategy is a method parameter, not shared mutable state.
     */
    @Transactional
    public Bill generateBill(Order order, PricingStrategy strategy) {
        log.info("Generating bill for order {} with strategy {}", order.getId(), strategy.getStrategyName());

        BigDecimal subtotal = strategy.calculateTotal(order);
        BigDecimal tax = taxCalculator.calculateTax(subtotal);
        BigDecimal total = subtotal.add(tax);

        Bill bill = new Bill(order, subtotal);
        bill.setTax(tax);
        bill.setTotal(total);
        bill.setPricingStrategy(strategy.getStrategyName());

        // Build line items
        order.getItems().forEach(item ->
            bill.addLineItem(
                item.getQuantity() + "x " + item.getMenuItem().getName(),
                item.getLineTotal()
            )
        );
        bill.addLineItem("VAT (20%)", tax);

        Bill saved = billRepository.save(bill);

        appendToHistoryLog(order, total, strategy);

        return saved;
    }

    @Transactional
    public Bill applyTip(Long billId, BigDecimal tipAmount) {
        Bill bill = billRepository.findById(billId)
            .orElseThrow(() -> new IllegalArgumentException("Bill not found: " + billId));
        BigDecimal validatedTip = tipHandler.validateFixedTip(tipAmount);
        bill.setTip(validatedTip);
        bill.setTotal(bill.getTotal().add(validatedTip));
        bill.addLineItem("Tip", validatedTip);
        return billRepository.save(bill);
    }

    @Transactional
    public Bill splitBill(Long billId, int guestCount) {
        Bill bill = billRepository.findById(billId)
            .orElseThrow(() -> new IllegalArgumentException("Bill not found: " + billId));
        bill.setSplitCount(guestCount);
        BigDecimal perGuest = splitBillService.calculatePerGuest(bill.getTotal(), guestCount);
        bill.addLineItem("Split " + guestCount + " ways — each guest pays", perGuest);
        return billRepository.save(bill);
    }

    private void appendToHistoryLog(Order order, BigDecimal total, PricingStrategy strategy) {
        String itemsSummary = order.getItems().stream()
            .map(i -> i.getMenuItem().getName())
            .reduce("", (a, b) -> a.isEmpty() ? b : a + ", " + b);

        OrderRecord record = new OrderRecord(
            order.getId(),
            order.getTable().getTableNumber(),
            order.getStaff().getId(),
            order.getStaff().getName(),
            itemsSummary,
            total,
            strategy.getStrategyName()
        );

        historyRepository.save(record);
        OrderHistoryLog.getInstance().append(record);
    }
}
