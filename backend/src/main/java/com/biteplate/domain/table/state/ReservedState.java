package com.biteplate.domain.table.state;

import com.biteplate.domain.table.RestaurantTable;
import com.biteplate.domain.table.TableStatus;

public class ReservedState implements TableState {
    @Override
    public void occupy(RestaurantTable table) {
        table.setStatus(TableStatus.OCCUPIED);
        table.setCurrentState(new OccupiedState());
    }

    @Override
    public void reserve(RestaurantTable table) {
        throw new IllegalStateException("Table is already reserved");
    }

    @Override
    public void awaitBill(RestaurantTable table) {
        throw new IllegalStateException("Reserved table cannot await bill");
    }

    @Override
    public void clear(RestaurantTable table) {
        table.setStatus(TableStatus.FREE);
        table.setCurrentState(new FreeState());
    }

    @Override
    public String getStatusName() { return "RESERVED"; }
}
