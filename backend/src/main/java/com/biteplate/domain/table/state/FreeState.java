package com.biteplate.domain.table.state;

import com.biteplate.domain.table.RestaurantTable;
import com.biteplate.domain.table.TableStatus;

public class FreeState implements TableState {
    @Override
    public void occupy(RestaurantTable table) {
        table.setStatus(TableStatus.OCCUPIED);
        table.setCurrentState(new OccupiedState());
    }

    @Override
    public void reserve(RestaurantTable table) {
        table.setStatus(TableStatus.RESERVED);
        table.setCurrentState(new ReservedState());
    }

    @Override
    public void awaitBill(RestaurantTable table) {
        throw new IllegalStateException("Free table cannot await bill");
    }

    @Override
    public void clear(RestaurantTable table) {
        // Already free — no-op
    }

    @Override
    public String getStatusName() { return "FREE"; }
}
