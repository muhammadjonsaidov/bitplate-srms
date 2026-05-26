package com.biteplate.domain.pricing;

import com.biteplate.domain.order.Order;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * STRATEGY PATTERN — ConcreteStrategy.
 * Loyalty Card: 10% off total. Free drink applied as credit note on the bill.
 */
@Component("loyaltyCardPricing")
public class LoyaltyCardPricingStrategy implements PricingStrategy {

    private static final BigDecimal DISCOUNT_RATE = new BigDecimal("0.10");
    private static final BigDecimal FREE_DRINK_CREDIT = new BigDecimal("3.00");

    @Override
    public BigDecimal calculateTotal(Order order) {
        BigDecimal subtotal = order.calculateSubtotal();
        BigDecimal discount = subtotal.multiply(DISCOUNT_RATE).setScale(2, RoundingMode.HALF_UP);
        BigDecimal afterDiscount = subtotal.subtract(discount);
        // Apply free drink credit (min 0)
        BigDecimal afterDrink = afterDiscount.subtract(FREE_DRINK_CREDIT);
        return afterDrink.compareTo(BigDecimal.ZERO) < 0 ? BigDecimal.ZERO : afterDrink;
    }

    @Override
    public String getStrategyName() {
        return "LOYALTY_CARD";
    }
}
