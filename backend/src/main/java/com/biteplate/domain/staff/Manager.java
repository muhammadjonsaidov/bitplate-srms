package com.biteplate.domain.staff;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@DiscriminatorValue("MANAGER")
@NoArgsConstructor
public class Manager extends Staff {

    public Manager(String name, String username, String password) {
        super(name, username, password);
    }

    @Override
    public List<String> getPermissions() {
        return List.of(
            "VIEW_MENU", "MANAGE_MENU",
            "VIEW_TABLES", "MANAGE_TABLES",
            "VIEW_ORDERS", "CREATE_ORDER", "MODIFY_ORDER", "CANCEL_ORDER",
            "VIEW_KITCHEN", "MANAGE_KITCHEN",
            "VIEW_BILLING", "PROCESS_BILLING",
            "VIEW_REPORTS", "VIEW_HISTORY",
            "MANAGE_STAFF"
        );
    }
}
