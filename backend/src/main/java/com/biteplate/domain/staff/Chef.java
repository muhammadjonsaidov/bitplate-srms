package com.biteplate.domain.staff;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@DiscriminatorValue("HEAD_CHEF")
@NoArgsConstructor
public class Chef extends Staff {

    public Chef(String name, String username, String password) {
        super(name, username, password);
    }

    @Override
    public List<String> getPermissions() {
        return List.of(
            "VIEW_MENU", "MANAGE_MENU",
            "VIEW_KITCHEN", "MANAGE_KITCHEN",
            "VIEW_ORDERS"
        );
    }
}
