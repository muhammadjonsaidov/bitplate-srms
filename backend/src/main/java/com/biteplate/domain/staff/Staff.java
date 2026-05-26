package com.biteplate.domain.staff;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * ABSTRACTION + INHERITANCE — abstract Staff class.
 *
 * Defines the contract for all staff types via abstract getPermissions().
 * Manager, Chef, Waiter, Cashier each provide their own permission list.
 * ENCAPSULATION — password protected; never exposed in API responses.
 */
@Entity
@Table(name = "staff")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name = "role", discriminatorType = DiscriminatorType.STRING)
@Getter
@Setter
@NoArgsConstructor
public abstract class Staff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 50)
    private String username;

    /** ENCAPSULATION — password never returned in API responses */
    @Column(nullable = false)
    private String password;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20, insertable = false, updatable = false)
    private StaffRole role;

    @Column(nullable = false)
    private boolean active = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    protected Staff(String name, String username, String password) {
        this.name = name;
        this.username = username;
        this.password = password;
    }

    /**
     * ABSTRACTION — each role defines its own allowed operations.
     * POLYMORPHISM — single method call works for Manager, Chef, Waiter, Cashier.
     */
    public abstract List<String> getPermissions();

    public boolean hasPermission(String permission) {
        return getPermissions().contains(permission);
    }

    @Override
    public String toString() {
        return String.format("%s [%s] — %s", name, role, username);
    }
}
