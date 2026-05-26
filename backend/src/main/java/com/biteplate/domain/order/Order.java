package com.biteplate.domain.order;

import com.biteplate.domain.notification.OrderObserver;
import com.biteplate.domain.notification.OrderSubject;
import com.biteplate.domain.staff.Staff;
import com.biteplate.domain.table.RestaurantTable;
import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * OBSERVER PATTERN — ConcreteSubject.
 * AGGREGATION — holds a collection of OrderItems.
 * ENCAPSULATION — items accessed via controlled methods; total calculated internally.
 */
@Entity
@Table(name = "orders")
@Getter
@Setter
@NoArgsConstructor
public class Order implements OrderSubject {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "table_id", nullable = false)
    private RestaurantTable table;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "staff_id", nullable = false)
    private Staff staff;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private OrderStatus status = OrderStatus.PENDING;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();

    /** COMPOSITION — OrderItems cannot exist without this Order */
    @JsonManagedReference
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<OrderItem> items = new ArrayList<>();

    /** Transient — observers not persisted, excluded from serialization */
    @JsonIgnore
    @Transient
    private final List<OrderObserver> observers = new ArrayList<>();

    public Order(RestaurantTable table, Staff staff) {
        this.table = table;
        this.staff = staff;
    }

    public void addItem(OrderItem item) {
        if (status != OrderStatus.PENDING) throw new IllegalStateException("Cannot add items after order is submitted");
        items.add(item);
        item.setOrder(this);
    }

    public void removeItem(OrderItem item) {
        if (status != OrderStatus.PENDING) throw new IllegalStateException("Cannot remove items after order is submitted");
        items.remove(item);
    }

    /** ENCAPSULATION — total computed internally */
    public BigDecimal calculateSubtotal() {
        return items.stream()
            .map(OrderItem::getLineTotal)
            .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    public void updateStatus(OrderStatus newStatus) {
        this.status = newStatus;
        this.updatedAt = LocalDateTime.now();
        notifyObservers(newStatus);
    }

    // OBSERVER PATTERN implementation
    @Override
    public void addObserver(OrderObserver observer) {
        observers.add(observer);
    }

    @Override
    public void removeObserver(OrderObserver observer) {
        observers.remove(observer);
    }

    @Override
    public void notifyObservers(OrderStatus newStatus) {
        observers.forEach(o -> o.onOrderStatusChanged(this, newStatus));
    }
}
