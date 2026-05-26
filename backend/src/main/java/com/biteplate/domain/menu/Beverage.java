package com.biteplate.domain.menu;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/** INHERITANCE — Beverage is a specialised MenuItem. */
@Entity
@DiscriminatorValue("BEVERAGE")
@NoArgsConstructor
public class Beverage extends MenuItem {

    public Beverage(String name, String description, BigDecimal price) {
        super(name, description, price);
    }

    @Override
    public String getCategory() {
        return "Beverage";
    }
}
