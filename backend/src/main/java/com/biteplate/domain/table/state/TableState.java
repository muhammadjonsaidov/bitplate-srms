package com.biteplate.domain.table.state;

import com.biteplate.domain.table.RestaurantTable;

/**
 * STATE PATTERN — State interface.
 *
 * Each concrete state implements only the transitions valid for that state.
 * Invalid transitions throw IllegalStateException.
 * The Table delegates all status-change calls to its current state object.
 */
public interface TableState {
    void occupy(RestaurantTable table);
    void reserve(RestaurantTable table);
    void awaitBill(RestaurantTable table);
    void clear(RestaurantTable table);
    String getStatusName();
}
