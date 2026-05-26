package com.biteplate.domain.table.state;

import com.biteplate.domain.table.RestaurantTable;
import com.biteplate.domain.table.TableStatus;

public class OccupiedState implements TableState {
    @Override
    public void occupy(RestaurantTable table) {
        throw new IllegalStateException("Table is already occupied");
    }

    @Override
    public void reserve(RestaurantTable table) {
        throw new IllegalStateException("Cannot reserve an occupied table");
    }

    @Override
    public void awaitBill(RestaurantTable table) {
        table.setStatus(TableStatus.AWAITING_BILL);
        table.setCurrentState(new AwaitingBillState());
    }

    @Override
    public void clear(RestaurantTable table) {
        table.setStatus(TableStatus.FREE);
        table.setCurrentState(new FreeState());
    }

    @Override
    public String getStatusName() { return "OCCUPIED"; }
}
