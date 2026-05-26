package com.biteplate.domain.order;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.Comparator;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.concurrent.CopyOnWriteArrayList;
import java.util.stream.Collectors;

/**
 * SINGLETON PATTERN — Thread-safe double-checked locking.
 * ITERATOR PATTERN — implements Iterable<OrderRecord>.
 *
 * Guarantees exactly ONE instance exists across all subsystems.
 * Every confirmed order is appended here for audit and analytics.
 *
 * Thread safety:
 * - volatile instance ensures visibility across threads
 * - double-checked locking prevents duplicate creation
 * - CopyOnWriteArrayList ensures thread-safe iteration
 *
 * Note: In production the log is backed by the database via OrderHistoryLogRepository.
 * This in-memory list acts as a cache for the current session.
 */
public class OrderHistoryLog implements Iterable<OrderRecord> {

    /** volatile — ensures changes visible across all threads immediately */
    private static volatile OrderHistoryLog instance;

    /** Thread-safe list — safe for concurrent reads and occasional writes */
    private final List<OrderRecord> records = new CopyOnWriteArrayList<>();

    /** Private constructor — prevents external instantiation */
    private OrderHistoryLog() {}

    /**
     * Double-checked locking — getInstance() is called frequently;
     * synchronisation only happens once during first creation.
     */
    public static OrderHistoryLog getInstance() {
        if (instance == null) {                          // first check (no lock)
            synchronized (OrderHistoryLog.class) {
                if (instance == null) {                  // second check (with lock)
                    instance = new OrderHistoryLog();
                }
            }
        }
        return instance;
    }

    public void append(OrderRecord record) {
        if (record == null) throw new IllegalArgumentException("Record cannot be null");
        records.add(record);
    }

    public List<OrderRecord> getAll() {
        return List.copyOf(records);
    }

    public List<OrderRecord> getOrdersInDateRange(LocalDate from, LocalDate to) {
        LocalDateTime start = from.atStartOfDay();
        LocalDateTime end = to.plusDays(1).atStartOfDay();
        return records.stream()
            .filter(r -> !r.getRecordedAt().isBefore(start) && r.getRecordedAt().isBefore(end))
            .toList();
    }

    public List<OrderRecord> getOrdersByTable(int tableNumber) {
        return records.stream()
            .filter(r -> r.getTableNumber() == tableNumber)
            .toList();
    }

    /**
     * ITERATOR usage — traverses records to find most frequently ordered item.
     */
    public String getMostFrequentlyOrderedItem() {
        Map<String, Long> frequency = records.stream()
            .flatMap(r -> List.of(r.getItemsSummary().split(",")).stream())
            .map(String::trim)
            .collect(Collectors.groupingBy(s -> s, Collectors.counting()));

        return frequency.entrySet().stream()
            .max(Comparator.comparingLong(Map.Entry::getValue))
            .map(Map.Entry::getKey)
            .orElse("No orders yet");
    }

    public void loadFromDatabase(List<OrderRecord> dbRecords) {
        records.clear();
        records.addAll(dbRecords);
    }

    public int size() { return records.size(); }

    /** ITERATOR PATTERN — returns custom iterator over records */
    @Override
    public Iterator<OrderRecord> iterator() {
        return new OrderHistoryIterator(List.copyOf(records));
    }
}
