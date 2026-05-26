package com.biteplate.domain.menu;

/**
 * DECORATOR PATTERN — Substitution (e.g. swap chips for salad).
 *
 * Modifies the description to note the substitution.
 * May apply a price difference (positive or negative).
 */
public class SubstitutionDecorator extends MenuItemDecorator {

    private final String substitution;
    private final java.math.BigDecimal priceDiff;

    public SubstitutionDecorator(MenuComponent wrappee, String substitution, java.math.BigDecimal priceDiff) {
        super(wrappee);
        this.substitution = substitution;
        this.priceDiff = priceDiff != null ? priceDiff : java.math.BigDecimal.ZERO;
    }

    @Override
    public String getDescription() {
        return wrappee.getDescription() + " [Sub: " + substitution + "]";
    }

    @Override
    public java.math.BigDecimal getPrice() {
        return wrappee.getPrice().add(priceDiff);
    }
}
