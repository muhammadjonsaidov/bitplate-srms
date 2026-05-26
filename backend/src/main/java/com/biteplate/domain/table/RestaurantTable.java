package com.biteplate.domain.table;

import com.biteplate.domain.table.state.*;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDateTime;

/**
 * STATE PATTERN — Context class.
 *
 * Delegates all status-change operations to the current TableState.
 * The state object changes itself when a valid transition occurs.
 * Invalid transitions are rejected by the state (no if/else chains here).
 */
@Entity
@Table(name = "restaurant_tables")
@Getter
@Setter
@NoArgsConstructor
public class RestaurantTable {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private int tableNumber;

    @Column(nullable = false)
    private int capacity;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private TableStatus status = TableStatus.FREE;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();

    /** Transient — state object not persisted; reconstructed from status on load */
    @Transient
    private TableState currentState;

    public RestaurantTable(int tableNumber, int capacity) {
        if (tableNumber <= 0) throw new IllegalArgumentException("Table number must be positive");
        if (capacity <= 0) throw new IllegalArgumentException("Capacity must be positive");
        this.tableNumber = tableNumber;
        this.capacity = capacity;
        this.currentState = new FreeState();
    }

    @PostLoad
    private void restoreState() {
        this.currentState = switch (status) {
            case FREE         -> new FreeState();
            case RESERVED     -> new ReservedState();
            case OCCUPIED     -> new OccupiedState();
            case AWAITING_BILL -> new AwaitingBillState();
            case CLEARED      -> new ClearedState();
        };
    }

    private TableState getState() {
        if (currentState == null) restoreState();
        return currentState;
    }

    public void occupy()    { getState().occupy(this); }
    public void reserve()   { getState().reserve(this); }
    public void awaitBill() { getState().awaitBill(this); }
    public void clear()     { getState().clear(this); }
}
