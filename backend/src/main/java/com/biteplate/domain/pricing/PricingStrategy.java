package com.biteplate.domain.pricing;

import com.biteplate.domain.order.Order;

import java.math.BigDecimal;

/**
 * STRATEGY PATTERN — Strategy interface.
 *
 * Defines the contract for all pricing algorithms.
 * BillingFacade holds a reference and swaps implementations at runtime
 * without any change to its own code (Open/Closed Principle).
 */
public interface PricingStrategy {
    BigDecimal calculateTotal(Order order);
    String getStrategyName();
}
