package com.biteplate.domain.factory;

import com.biteplate.domain.menu.Dessert;
import com.biteplate.domain.menu.MenuItem;

import java.math.BigDecimal;

/** FACTORY METHOD — creates Dessert instances. */
public class DessertFactory extends MenuItemFactory {
    @Override
    public MenuItem createMenuItem(String name, String description, BigDecimal price) {
        return new Dessert(name, description, price);
    }
}
