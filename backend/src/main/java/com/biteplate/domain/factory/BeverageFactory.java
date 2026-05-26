package com.biteplate.domain.factory;

import com.biteplate.domain.menu.Beverage;
import com.biteplate.domain.menu.MenuItem;

import java.math.BigDecimal;

/** FACTORY METHOD — creates Beverage instances. */
public class BeverageFactory extends MenuItemFactory {
    @Override
    public MenuItem createMenuItem(String name, String description, BigDecimal price) {
        return new Beverage(name, description, price);
    }
}
