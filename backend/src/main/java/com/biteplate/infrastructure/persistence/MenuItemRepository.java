package com.biteplate.infrastructure.persistence;

import com.biteplate.domain.menu.MenuItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface MenuItemRepository extends JpaRepository<MenuItem, Long> {
    List<MenuItem> findByAvailableTrue();

    @Query("SELECT m FROM MenuItem m WHERE TYPE(m) = :type AND m.available = true")
    List<MenuItem> findByTypeAndAvailable(@org.springframework.data.repository.query.Param("type") Class<? extends MenuItem> type);

    List<MenuItem> findByNameContainingIgnoreCase(String name);
}
