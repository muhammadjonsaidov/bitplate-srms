package com.biteplate.domain.pricing;

import com.biteplate.domain.order.Order;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * STRATEGY PATTERN — ConcreteStrategy.
 * Happy Hour: 20% discount on all items (e.g. 3pm–5pm).
 * Swapped in by BillingService at runtime — no change to BillingFacade needed.
 */
@Component("happyHourPricing")
public class HappyHourPricingStrategy implements PricingStrategy {

    private static final BigDecimal DISCOUNT_RATE = new BigDecimal("0.20");

    @Override
    public BigDecimal calculateTotal(Order order) {
        BigDecimal subtotal = order.calculateSubtotal();
        BigDecimal discount = subtotal.multiply(DISCOUNT_RATE).setScale(2, RoundingMode.HALF_UP);
        return subtotal.subtract(discount);
    }

    @Override
    public String getStrategyName() {
        return "HAPPY_HOUR";
    }
}
