package com.biteplate.domain.factory;

import com.biteplate.domain.menu.MenuItem;
import com.biteplate.domain.menu.Starter;

import java.math.BigDecimal;

/** FACTORY METHOD — creates Starter instances. */
public class StarterFactory extends MenuItemFactory {
    @Override
    public MenuItem createMenuItem(String name, String description, BigDecimal price) {
        return new Starter(name, description, price);
    }
}
