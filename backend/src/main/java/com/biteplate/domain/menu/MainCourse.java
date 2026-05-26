package com.biteplate.domain.menu;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/** INHERITANCE — MainCourse is a specialised MenuItem. */
@Entity
@DiscriminatorValue("MAIN_COURSE")
@NoArgsConstructor
public class MainCourse extends MenuItem {

    public MainCourse(String name, String description, BigDecimal price) {
        super(name, description, price);
    }

    @Override
    public String getCategory() {
        return "Main Course";
    }
}
