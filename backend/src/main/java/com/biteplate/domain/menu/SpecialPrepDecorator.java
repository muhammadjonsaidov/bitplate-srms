package com.biteplate.domain.menu;

/**
 * DECORATOR PATTERN — Adds special preparation note.
 *
 * E.g. "well done", "no salt", "gluten-free bread".
 * Adds a surcharge if preparation requires extra effort.
 */
public class SpecialPrepDecorator extends MenuItemDecorator {

    private final String prepNote;
    private final java.math.BigDecimal surcharge;

    public SpecialPrepDecorator(MenuComponent wrappee, String prepNote, java.math.BigDecimal surcharge) {
        super(wrappee);
        this.prepNote = prepNote;
        this.surcharge = surcharge != null ? surcharge : java.math.BigDecimal.ZERO;
    }

    @Override
    public String getDescription() {
        return wrappee.getDescription() + " [Special prep: " + prepNote + "]";
    }

    @Override
    public java.math.BigDecimal getPrice() {
        return wrappee.getPrice().add(surcharge);
    }
}
