package com.biteplate.domain.pricing;

import com.biteplate.domain.order.Order;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;

/**
 * STRATEGY PATTERN — ConcreteStrategy (default).
 * No discount applied — full price for all items.
 */
@Component("standardPricing")
public class StandardPricingStrategy implements PricingStrategy {

    @Override
    public BigDecimal calculateTotal(Order order) {
        return order.calculateSubtotal();
    }

    @Override
    public String getStrategyName() {
        return "STANDARD";
    }
}
