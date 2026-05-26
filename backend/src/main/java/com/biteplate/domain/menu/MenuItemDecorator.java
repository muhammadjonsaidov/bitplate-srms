package com.biteplate.domain.menu;

import java.math.BigDecimal;

/**
 * DECORATOR PATTERN — Abstract base decorator.
 *
 * Wraps a MenuComponent and delegates all calls to it.
 * Concrete decorators override only what they need to change.
 * Allows adding allergen flags, special prep notes, substitutions
 * at runtime without modifying MenuItem subclasses.
 */
public abstract class MenuItemDecorator implements MenuComponent {

    protected final MenuComponent wrappee;

    protected MenuItemDecorator(MenuComponent wrappee) {
        if (wrappee == null) throw new IllegalArgumentException("Wrappee cannot be null");
        this.wrappee = wrappee;
    }

    @Override
    public String getName() {
        return wrappee.getName();
    }

    @Override
    public String getDescription() {
        return wrappee.getDescription();
    }

    @Override
    public BigDecimal getPrice() {
        return wrappee.getPrice();
    }

    @Override
    public void display() {
        wrappee.display();
    }
}
