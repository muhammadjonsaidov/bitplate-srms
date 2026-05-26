package com.biteplate.domain.order;

import java.util.Iterator;
import java.util.List;
import java.util.NoSuchElementException;

/**
 * ITERATOR PATTERN — ConcreteIterator.
 *
 * Provides sequential access to OrderRecord objects without exposing
 * the internal List structure of OrderHistoryLog.
 * Decouples traversal logic from the collection storage format.
 */
public class OrderHistoryIterator implements Iterator<OrderRecord> {

    private final List<OrderRecord> records;
    private int cursor = 0;

    public OrderHistoryIterator(List<OrderRecord> records) {
        this.records = List.copyOf(records); // snapshot — safe for concurrent access
    }

    @Override
    public boolean hasNext() {
        return cursor < records.size();
    }

    @Override
    public OrderRecord next() {
        if (!hasNext()) throw new NoSuchElementException("No more order records");
        return records.get(cursor++);
    }
}
