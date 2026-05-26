package com.biteplate.domain.staff;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

/**
 * Base staff entity. All roles (Manager, Chef, Waiter, Cashier) extend this class
 * and implement their own permission sets via {@link #getPermissions()}.
 *
 * Password is never included in API responses.
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
     * Returns the list of operations permitted for this staff role.
     * Each subclass provides its own implementation.
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
