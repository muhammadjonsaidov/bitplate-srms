package com.biteplate.application;

import com.biteplate.domain.billing.Bill;
import com.biteplate.domain.billing.BillingFacade;
import com.biteplate.domain.kitchen.KitchenQueue;
import com.biteplate.domain.kitchen.ServeOrderCommand;
import com.biteplate.domain.notification.KitchenDisplayObserver;
import com.biteplate.domain.notification.ManagerDashboard;
import com.biteplate.domain.notification.WaiterNotifier;
import com.biteplate.domain.order.Order;
import com.biteplate.domain.order.OrderStatus;
import com.biteplate.domain.pricing.HappyHourPricingStrategy;
import com.biteplate.domain.pricing.LoyaltyCardPricingStrategy;
import com.biteplate.domain.pricing.PricingStrategy;
import com.biteplate.domain.pricing.StandardPricingStrategy;
import com.biteplate.exception.BadRequestException;
import com.biteplate.infrastructure.persistence.BillRepository;
import com.biteplate.infrastructure.persistence.OrderRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalTime;

@Service
@RequiredArgsConstructor
public class BillingService {

    private final BillingFacade billingFacade;
    private final BillRepository billRepository;
    private final OrderRepository orderRepository;
    private final KitchenQueue kitchenQueue;

    private final WaiterNotifier waiterNotifier;
    private final ManagerDashboard managerDashboard;
    private final KitchenDisplayObserver kitchenDisplayObserver;

    private final StandardPricingStrategy standardPricing;
    private final HappyHourPricingStrategy happyHourPricing;
    private final LoyaltyCardPricingStrategy loyaltyCardPricing;

    /**
     * COMMAND → STRATEGY → SINGLETON coherent flow:
     * 1. ServeOrderCommand marks order complete (Command Pattern via KitchenQueue)
     * 2. PricingStrategy calculates the total (Strategy Pattern)
     * 3. BillingFacade appends the record to OrderHistoryLog (Singleton Pattern)
     */
    @Transactional
    public Bill generateBill(Long orderId, String strategyName) {
        Order order = orderRepository.findById(orderId)
            .orElseThrow(() -> new IllegalArgumentException("Order not found: " + orderId));

        if (order.getStatus() == OrderStatus.CANCELLED) {
            throw new BadRequestException("Cannot generate bill for a cancelled order");
        }

        // COMMAND PATTERN — mark order served via KitchenQueue invoker (idempotent: skip if already SERVED)
        if (order.getStatus() != OrderStatus.SERVED) {
            order.addObserver(waiterNotifier);
            order.addObserver(managerDashboard);
            order.addObserver(kitchenDisplayObserver);
            kitchenQueue.execute(new ServeOrderCommand(order));
            orderRepository.save(order);
        }

        // STRATEGY PATTERN — resolve and pass strategy at runtime
        PricingStrategy strategy = selectStrategy(strategyName);

        // SINGLETON — OrderHistoryLog.getInstance().append() fires inside BillingFacade
        return billingFacade.generateBill(order, strategy);
    }

    @Transactional
    public Bill applyTip(Long billId, BigDecimal tip) {
        return billingFacade.applyTip(billId, tip);
    }

    @Transactional
    public Bill splitBill(Long billId, int guests) {
        return billingFacade.splitBill(billId, guests);
    }

    @Transactional
    public Bill markPaid(Long billId) {
        Bill bill = billRepository.findById(billId)
            .orElseThrow(() -> new IllegalArgumentException("Bill not found: " + billId));
        bill.setPaid(true);
        return billRepository.save(bill);
    }

    public Bill findByOrderId(Long orderId) {
        return billRepository.findByOrderId(orderId)
            .orElseThrow(() -> new IllegalArgumentException("No bill for order: " + orderId));
    }

    /**
     * Resolves strategy name to implementation.
     * Auto-detects happy hour if no explicit strategy given.
     */
    private PricingStrategy selectStrategy(String strategyName) {
        if (strategyName == null || strategyName.equalsIgnoreCase("AUTO")) {
            LocalTime now = LocalTime.now();
            if (now.isAfter(LocalTime.of(15, 0)) && now.isBefore(LocalTime.of(17, 0))) {
                return happyHourPricing;
            }
            return standardPricing;
        }
        return switch (strategyName.toUpperCase()) {
            case "HAPPY_HOUR"    -> happyHourPricing;
            case "LOYALTY_CARD"  -> loyaltyCardPricing;
            default              -> standardPricing;
        };
    }
}
