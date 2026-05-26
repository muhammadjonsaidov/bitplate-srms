package com.biteplate.domain.factory;

import com.biteplate.domain.menu.MainCourse;
import com.biteplate.domain.menu.MenuItem;

import java.math.BigDecimal;

/** FACTORY METHOD — creates MainCourse instances. */
public class MainCourseFactory extends MenuItemFactory {
    @Override
    public MenuItem createMenuItem(String name, String description, BigDecimal price) {
        return new MainCourse(name, description, price);
    }
}
