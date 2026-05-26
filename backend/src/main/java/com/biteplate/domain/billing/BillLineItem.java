package com.biteplate.domain.billing;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * COMPOSITION — BillLineItem cannot exist without a Bill.
 * Immutable value object representing one line on the bill.
 */
@Entity
@Table(name = "bill_line_items")
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class BillLineItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bill_id", nullable = false)
    private Bill bill;

    @Column(nullable = false, length = 255)
    private String description;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal amount;

    public BillLineItem(Bill bill, String description, BigDecimal amount) {
        this.bill = bill;
        this.description = description;
        this.amount = amount;
    }
}
