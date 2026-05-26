package com.biteplate.infrastructure.persistence;

import com.biteplate.domain.table.RestaurantTable;
import com.biteplate.domain.table.TableStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TableRepository extends JpaRepository<RestaurantTable, Long> {
    List<RestaurantTable> findByStatus(TableStatus status);
    Optional<RestaurantTable> findByTableNumber(int tableNumber);
    List<RestaurantTable> findAllByOrderByTableNumberAsc();
}
