package com.biteplate.domain.menu;

import java.math.BigDecimal;

/**
 * COMPOSITE PATTERN — Component interface.
 *
 * Both leaf (MenuItem) and composite (ComboMeal) implement this.
 * Allows treating individual items and combos uniformly.
 */
public interface MenuComponent {
    String getName();
    String getDescription();
    BigDecimal getPrice();
    void display();
}
