package com.biteplate.domain.table.state;

import com.biteplate.domain.table.RestaurantTable;
import com.biteplate.domain.table.TableStatus;

public class AwaitingBillState implements TableState {
    @Override
    public void occupy(RestaurantTable table) {
        throw new IllegalStateException("Table is awaiting bill");
    }

    @Override
    public void reserve(RestaurantTable table) {
        throw new IllegalStateException("Table is awaiting bill");
    }

    @Override
    public void awaitBill(RestaurantTable table) {
        // Already awaiting — no-op
    }

    @Override
    public void clear(RestaurantTable table) {
        table.setStatus(TableStatus.CLEARED);
        table.setCurrentState(new ClearedState());
    }

    @Override
    public String getStatusName() { return "AWAITING_BILL"; }
}
