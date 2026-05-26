package com.biteplate.domain.billing;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

/** Sub-component hidden behind BillingFacade. */
@Component
public class TaxCalculator {
    private static final BigDecimal VAT_RATE = new BigDecimal("0.20"); // UK 20% VAT

    public BigDecimal calculateTax(BigDecimal subtotal) {
        return subtotal.multiply(VAT_RATE).setScale(2, RoundingMode.HALF_UP);
    }

    public BigDecimal calculateSubtotalExTax(BigDecimal totalIncTax) {
        return totalIncTax.divide(BigDecimal.ONE.add(VAT_RATE), 2, RoundingMode.HALF_UP);
    }
}
