package com.biteplate.domain.menu;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * COMPOSITE PATTERN — Leaf node.
 * INHERITANCE — abstract base for Starter, MainCourse, Dessert, Beverage.
 * ENCAPSULATION — price and allergens protected; accessed via getters only.
 *
 * Uses single-table inheritance (dtype discriminator column).
 */
@Entity
@Table(name = "menu_items")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "dtype", discriminatorType = DiscriminatorType.STRING)
@Getter
@Setter
@NoArgsConstructor
public abstract class MenuItem implements MenuComponent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal price;

    @Column(nullable = false)
    private boolean available = true;

    @Column
    private String allergens;

    protected MenuItem(String name, String description, BigDecimal price) {
        if (name == null || name.isBlank()) throw new IllegalArgumentException("Menu item name required");
        if (price == null || price.compareTo(BigDecimal.ZERO) < 0) throw new IllegalArgumentException("Price must be non-negative");
        this.name = name;
        this.description = description;
        this.price = price;
    }

    /**
     * POLYMORPHISM — each subclass provides its own category label.
     * A single method call works for Starter, MainCourse, Dessert, Beverage.
     */
    public abstract String getCategory();

    @Override
    public void display() {
        System.out.printf("[%s] %s — £%.2f%n", getCategory(), name, price);
    }

    @Override
    public String toString() {
        return String.format("%s: %s (£%.2f)", getCategory(), name, price);
    }
}
