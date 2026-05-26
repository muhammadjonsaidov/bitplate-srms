package com.biteplate.domain.billing;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

/** Sub-component hidden behind BillingFacade. */
@Component
public class SplitBillService {

    public BigDecimal calculatePerGuest(BigDecimal total, int guests) {
        if (guests <= 0) throw new IllegalArgumentException("Guest count must be positive");
        return total.divide(BigDecimal.valueOf(guests), 2, RoundingMode.HALF_UP);
    }
}
