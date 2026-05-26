package com.biteplate.domain.factory;

import com.biteplate.domain.menu.MenuItem;

import java.math.BigDecimal;

/**
 * FACTORY METHOD PATTERN — Abstract creator.
 *
 * Defines the factory method createMenuItem() which subclasses override
 * to instantiate the correct MenuItem type.
 * The client only works with the abstract factory — never with concrete classes directly.
 */
public abstract class MenuItemFactory {

    /**
     * Factory method — subclasses decide which MenuItem to create.
     */
    public abstract MenuItem createMenuItem(String name, String description, BigDecimal price);

    /**
     * Template method — creates and validates the menu item.
     */
    public MenuItem createAndValidate(String name, String description, BigDecimal price) {
        if (name == null || name.isBlank()) throw new IllegalArgumentException("Name required");
        if (price == null || price.compareTo(BigDecimal.ZERO) < 0) throw new IllegalArgumentException("Price must be non-negative");
        return createMenuItem(name, description, price);
    }

    /**
     * Factory registry — returns correct factory for a given category string.
     */
    public static MenuItemFactory forCategory(String category) {
        return switch (category.toUpperCase()) {
            case "STARTER"     -> new StarterFactory();
            case "MAIN_COURSE" -> new MainCourseFactory();
            case "DESSERT"     -> new DessertFactory();
            case "BEVERAGE"    -> new BeverageFactory();
            default -> throw new IllegalArgumentException("Unknown menu item category: " + category);
        };
    }
}
