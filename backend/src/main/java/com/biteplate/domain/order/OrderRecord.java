package com.biteplate.domain.order;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Persistent record stored by OrderHistoryLog (Singleton).
 * Immutable snapshot of an order at time of completion.
 */
@Entity
@Table(name = "order_history_log")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class OrderRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private Long orderId;

    @Column(nullable = false)
    private int tableNumber;

    @Column(nullable = false)
    private Long staffId;

    @Column(nullable = false, length = 100)
    private String staffName;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String itemsSummary;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    @Column(nullable = false, length = 50)
    private String pricingStrategy;

    @Column(nullable = false)
    private LocalDateTime recordedAt = LocalDateTime.now();

    public OrderRecord(Long orderId, int tableNumber, Long staffId, String staffName,
                       String itemsSummary, BigDecimal total, String pricingStrategy) {
        this.orderId = orderId;
        this.tableNumber = tableNumber;
        this.staffId = staffId;
        this.staffName = staffName;
        this.itemsSummary = itemsSummary;
        this.total = total;
        this.pricingStrategy = pricingStrategy;
    }
}
