package com.biteplate.domain.staff;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@DiscriminatorValue("WAITER")
@NoArgsConstructor
public class Waiter extends Staff {

    public Waiter(String name, String username, String password) {
        super(name, username, password);
    }

    @Override
    public List<String> getPermissions() {
        return List.of(
            "VIEW_MENU",
            "VIEW_TABLES", "MANAGE_TABLES",
            "VIEW_ORDERS", "CREATE_ORDER", "MODIFY_ORDER"
        );
    }
}
