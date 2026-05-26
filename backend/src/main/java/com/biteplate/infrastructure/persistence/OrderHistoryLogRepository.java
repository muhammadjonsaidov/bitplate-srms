package com.biteplate.infrastructure.persistence;

import com.biteplate.domain.order.OrderRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDateTime;
import java.util.List;

public interface OrderHistoryLogRepository extends JpaRepository<OrderRecord, Long> {
    List<OrderRecord> findByTableNumberOrderByRecordedAtDesc(int tableNumber);
    List<OrderRecord> findByRecordedAtBetweenOrderByRecordedAtDesc(LocalDateTime from, LocalDateTime to);

    @Query("SELECT r.itemsSummary FROM OrderRecord r WHERE r.recordedAt >= :since ORDER BY r.recordedAt DESC")
    List<String> findItemsSummariesSince(@org.springframework.data.repository.query.Param("since") LocalDateTime since);
}
