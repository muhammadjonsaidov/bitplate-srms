package com.biteplate.domain.menu;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/** INHERITANCE — Starter is a specialised MenuItem. */
@Entity
@DiscriminatorValue("STARTER")
@NoArgsConstructor
public class Starter extends MenuItem {

    public Starter(String name, String description, BigDecimal price) {
        super(name, description, price);
    }

    @Override
    public String getCategory() {
        return "Starter";
    }
}
