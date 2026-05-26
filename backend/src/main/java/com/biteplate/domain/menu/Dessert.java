package com.biteplate.domain.menu;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/** INHERITANCE — Dessert is a specialised MenuItem. */
@Entity
@DiscriminatorValue("DESSERT")
@NoArgsConstructor
public class Dessert extends MenuItem {

    public Dessert(String name, String description, BigDecimal price) {
        super(name, description, price);
    }

    @Override
    public String getCategory() {
        return "Dessert";
    }
}
