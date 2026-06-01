package com.biteplate.infrastructure.persistence;

import com.biteplate.domain.order.Order;
import com.biteplate.domain.order.OrderStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {
    List<Order> findByTableId(Long tableId);
    List<Order> findByStatus(OrderStatus status);
    List<Order> findByStaffId(Long staffId);

    @Query("SELECT o FROM Order o WHERE o.status IN ('PENDING','PREPARING','READY') ORDER BY o.createdAt ASC")
    List<Order> findActiveOrders();
}
