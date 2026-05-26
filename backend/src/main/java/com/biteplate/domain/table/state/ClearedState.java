package com.biteplate.domain.table.state;

import com.biteplate.domain.table.RestaurantTable;
import com.biteplate.domain.table.TableStatus;

public class ClearedState implements TableState {
    @Override
    public void occupy(RestaurantTable table) {
        throw new IllegalStateException("Table needs to be reset to FREE first");
    }

    @Override
    public void reserve(RestaurantTable table) {
        throw new IllegalStateException("Table needs to be reset to FREE first");
    }

    @Override
    public void awaitBill(RestaurantTable table) {
        throw new IllegalStateException("Table is cleared");
    }

    @Override
    public void clear(RestaurantTable table) {
        table.setStatus(TableStatus.FREE);
        table.setCurrentState(new FreeState());
    }

    @Override
    public String getStatusName() { return "CLEARED"; }
}
