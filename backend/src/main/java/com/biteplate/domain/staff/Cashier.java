package com.biteplate.domain.staff;

import jakarta.persistence.DiscriminatorValue;
import jakarta.persistence.Entity;
import lombok.NoArgsConstructor;

import java.util.List;

@Entity
@DiscriminatorValue("CASHIER")
@NoArgsConstructor
public class Cashier extends Staff {

    public Cashier(String name, String username, String password) {
        super(name, username, password);
    }

    @Override
    public List<String> getPermissions() {
        return List.of(
            "VIEW_ORDERS",
            "VIEW_BILLING", "PROCESS_BILLING"
        );
    }
}
