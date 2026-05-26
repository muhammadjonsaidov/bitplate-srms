package com.biteplate.domain.menu;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

/**
 * COMPOSITE PATTERN — Composite node.
 *
 * ComboMeal contains multiple MenuComponents (individual items or other combos).
 * Its price is the sum of all children — calculated uniformly via MenuComponent.getPrice().
 * The kitchen and billing systems treat ComboMeal identically to a single MenuItem.
 */
@Entity
@Table(name = "combo_meals")
@Getter
@Setter
@NoArgsConstructor
public class ComboMeal implements MenuComponent {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private boolean available = true;

    /**
     * The children — individual MenuItems in this combo.
     * COMPOSITION: ComboMeal owns its items; items cannot exist without the combo context.
     */
    @ManyToMany
    @JoinTable(
        name = "combo_meal_items",
        joinColumns = @JoinColumn(name = "combo_meal_id"),
        inverseJoinColumns = @JoinColumn(name = "menu_item_id")
    )
    private List<MenuItem> items = new ArrayList<>();

    public ComboMeal(String name, String description) {
        if (name == null || name.isBlank()) throw new IllegalArgumentException("Combo meal name required");
        this.name = name;
        this.description = description;
    }

    public void add(MenuItem item) {
        items.add(item);
    }

    public void remove(MenuItem item) {
        items.remove(item);
    }

    /**
     * COMPOSITE PATTERN — price sums all children uniformly via MenuComponent interface.
     */
    @Override
    public BigDecimal getPrice() {
        return items.stream()
            .map(MenuComponent::getPrice)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    @Override
    public void display() {
        System.out.printf("[Combo] %s — £%.2f%n", name, getPrice());
        items.forEach(item -> System.out.printf("  + %s%n", item.getName()));
    }
}
