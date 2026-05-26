package com.biteplate.domain.billing;

import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.math.RoundingMode;

/** Sub-component hidden behind BillingFacade. */
@Component
public class TipHandler {

    public BigDecimal applyPercentageTip(BigDecimal subtotal, int percentage) {
        if (percentage < 0 || percentage > 100) throw new IllegalArgumentException("Tip percentage must be 0–100");
        return subtotal.multiply(BigDecimal.valueOf(percentage))
            .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
    }

    public BigDecimal validateFixedTip(BigDecimal tip) {
        if (tip == null || tip.compareTo(BigDecimal.ZERO) < 0) throw new IllegalArgumentException("Tip cannot be negative");
        return tip.setScale(2, RoundingMode.HALF_UP);
    }
}
