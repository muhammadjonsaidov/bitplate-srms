package com.biteplate.application;

import com.biteplate.domain.table.RestaurantTable;
import com.biteplate.domain.table.TableStatus;
import com.biteplate.infrastructure.persistence.TableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class TableService {

    private final TableRepository tableRepository;

    public List<RestaurantTable> findAll() {
        return tableRepository.findAllByOrderByTableNumberAsc();
    }

    public RestaurantTable findById(Long id) {
        return tableRepository.findById(id)
            .orElseThrow(() -> new IllegalArgumentException("Table not found: " + id));
    }

    @Transactional
    public RestaurantTable seatCustomer(Long tableId) {
        RestaurantTable table = findById(tableId);
        table.occupy(); // STATE PATTERN — delegates to FreeState or ReservedState
        return tableRepository.save(table);
    }

    @Transactional
    public RestaurantTable reserveTable(Long tableId) {
        RestaurantTable table = findById(tableId);
        table.reserve();
        return tableRepository.save(table);
    }

    @Transactional
    public RestaurantTable requestBill(Long tableId) {
        RestaurantTable table = findById(tableId);
        table.awaitBill(); // STATE PATTERN — OccupiedState transitions to AwaitingBillState
        return tableRepository.save(table);
    }

    @Transactional
    public RestaurantTable clearTable(Long tableId) {
        RestaurantTable table = findById(tableId);
        table.clear(); // STATE PATTERN — transitions to Cleared then Free
        return tableRepository.save(table);
    }

    public List<RestaurantTable> findByStatus(TableStatus status) {
        return tableRepository.findByStatus(status);
    }
}
