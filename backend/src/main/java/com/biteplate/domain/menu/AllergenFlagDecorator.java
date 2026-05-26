package com.biteplate.domain.menu;

import java.math.BigDecimal;

/**
 * DECORATOR PATTERN — Adds allergen warning to any MenuComponent.
 *
 * Applied at runtime when a customer declares an allergy.
 * Does not change the price; appends a warning to the description.
 */
public class AllergenFlagDecorator extends MenuItemDecorator {

    private final String allergen;

    public AllergenFlagDecorator(MenuComponent wrappee, String allergen) {
        super(wrappee);
        this.allergen = allergen;
    }

    @Override
    public String getDescription() {
        return wrappee.getDescription() + " ⚠️ ALLERGEN: " + allergen.toUpperCase();
    }

    @Override
    public void display() {
        super.display();
        System.out.println("  ⚠️  ALLERGEN ALERT: " + allergen);
    }
}
