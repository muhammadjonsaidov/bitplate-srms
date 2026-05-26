package com.biteplate.domain.billing;

import com.biteplate.domain.order.Order;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * COMPOSITION — Bill is composed of BillLineItems that cannot exist independently.
 * ENCAPSULATION — total computed and set by BillingFacade only.
 */
@Entity
@Table(name = "bills")
@Getter
@Setter
@NoArgsConstructor
public class Bill {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    private Order order;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal tax = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal tip = BigDecimal.ZERO;

    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;

    @Column(nullable = false, length = 50)
    private String pricingStrategy = "STANDARD";

    @Column(nullable = false)
    private int splitCount = 1;

    @Column(nullable = false)
    private boolean paid = false;

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    /** COMPOSITION — line items owned by this bill */
    @OneToMany(mappedBy = "bill", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BillLineItem> lineItems = new ArrayList<>();

    public Bill(Order order, BigDecimal subtotal) {
        this.order = order;
        this.subtotal = subtotal;
        this.total = subtotal;
    }

    public void addLineItem(String description, BigDecimal amount) {
        lineItems.add(new BillLineItem(this, description, amount));
    }

    public BigDecimal getAmountPerGuest() {
        return splitCount > 1 ? total.divide(BigDecimal.valueOf(splitCount), 2, java.math.RoundingMode.HALF_UP) : total;
    }
}
