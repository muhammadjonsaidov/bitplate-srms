# Task 4 — Scenario Investigation

> **Unit 27 Advanced Programming — Y/615/1651**  
> Five scenarios investigated using BitePlate SRMS design patterns

---

## Scenario 1: Expanding Menu — Adding a "Kids' Meal" Category

**Situation:** The restaurant introduces a children's menu with age-appropriate portioning, price cap of £8.00, and mandatory allergen checks.

**Current design response:**

The **Factory Method** pattern handles this with zero changes to existing code:

```java
// New class: application/menu/factory/KidsMealFactory.java
public class KidsMealFactory extends MenuItemFactory {
    private static final BigDecimal MAX_PRICE = new BigDecimal("8.00");

    @Override
    public MenuItem createAndValidate(String name, BigDecimal price) {
        if (price.compareTo(MAX_PRICE) > 0)
            throw new IllegalArgumentException("Kids' meal cannot exceed £8.00");
        KidsMeal item = new KidsMeal();
        item.setName(name);
        item.setPrice(price);
        validate(item);
        return item;
    }
}
```

`MenuItemFactory.forCategory()` gains one `case "KIDS_MEAL" -> new KidsMealFactory()`. `AllergenFlagDecorator` wraps the new item automatically — the Decorator pattern requires no changes at all because it operates on `MenuComponent`, not a specific subclass.

**Database impact:** Single-Table Inheritance means the `menu_items` table gains a new `dtype = 'KIDS_MEAL'` row — no schema migration required beyond optional category-specific columns.

**Assessment:** The system handles this scenario with minimal code change, demonstrating the Open/Closed Principle in practice.

---

## Scenario 2: Reservation Pipeline — Customer Books a Table in Advance

**Situation:** Customers can now book tables online, with automatic confirmation emails and a 15-minute hold timeout.

**Current design response:**

The **State** pattern already has `RESERVED` as a valid table state. The gap is the timeout and the notification mechanism.

**Proposed extension:**

```java
// domain/table/state/ReservedState.java — enhanced
public class ReservedState implements TableState {
    private final LocalDateTime expiresAt;

    public ReservedState(LocalDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public boolean isExpired() {
        return LocalDateTime.now().isAfter(expiresAt);
    }
}
```

A `@Scheduled(fixedDelay = 60_000)` Spring task scans all `RESERVED` tables and calls `table.expire()` on expired ones, transitioning back to `FREE`. An **Observer** is registered on the `RestaurantTable` entity (not just `Order`) to emit a `ReservationExpiredEvent`, consumed by an email service.

The **Facade** pattern would be extended: `ReservationFacade` wraps table state changes + email dispatch + calendar sync behind a single `createReservation(tableId, customerId, dateTime)` call.

**Assessment:** Requires moderate extension — a new facade, a scheduler, and observer registration on Table — but none of the existing pattern implementations need modification.

---

## Scenario 3: Franchise Rollout — 50 Restaurants on One Platform

**Situation:** BitePlate is licensed to 50 franchise restaurants. Each has its own menu, staff, pricing, and reporting, but shares a central analytics dashboard.

**Design implications:**

1. **Singleton must go.** `OrderHistoryLog` as a JVM Singleton collapses — each restaurant needs its own history, and horizontal scaling means multiple JVM instances. Replace with `OrderHistoryRepository` (JPA + PostgreSQL), partitioned by `restaurant_id`.

2. **Strategy pattern scales perfectly.** Each franchise can have its own pricing strategy (e.g., `FranchisePricingStrategy` reads discount rates from a per-restaurant config table). `BillingFacade` needs no changes.

3. **Observer + Redis Pub/Sub** — channels gain a restaurant prefix: `notifications:restaurant:{id}:waiter`. Redis Cluster handles 50 × 3 = 150 channels trivially.

4. **State pattern** — `RestaurantTable` gains a `restaurant_id` FK. All queries are filtered by tenant. No state logic changes needed.

5. **Multi-tenancy auth** — `Staff.restaurantId` is added; `SecurityConfig` enforces that JWT claims include `restaurantId`, and all service methods validate that the requested resource belongs to the authenticated tenant.

**Assessment:** The pattern layer is largely tenant-agnostic. The main work is data layer partitioning (FK on every table) and JWT claim enrichment.

---

## Scenario 4: End-of-Night Report — Manager Views Daily Revenue Analytics

**Situation:** At closing, the manager wants a report: total revenue, orders by category, average bill value, busiest hour, and a list of unclosed tables.

**Current design response:**

The **Iterator** pattern is designed for exactly this. `OrderHistoryLog.iterator()` returns a snapshot-safe `OrderHistoryIterator`:

```java
// In ReportService.java
OrderHistoryLog log = OrderHistoryLog.getInstance();
Iterator<OrderRecord> it = log.iterator();
BigDecimal totalRevenue = BigDecimal.ZERO;
Map<String, Long> ordersByCategory = new HashMap<>();

while (it.hasNext()) {
    OrderRecord record = it.next();
    if (record.getTimestamp().toLocalDate().equals(LocalDate.now())) {
        totalRevenue = totalRevenue.add(record.getTotal());
        ordersByCategory.merge(record.getStrategy(), 1L, Long::sum);
    }
}
```

The **Composite** pattern contributes: `ComboMeal.getPrice()` recursively computes the correct revenue attribution even for nested combo structures.

The **Singleton** ensures the same log instance is read — no partial reads across multiple instances.

**Limitation:** If history exceeds tens of thousands of records, iterating the in-memory list is slow. The production fix is a dedicated aggregate query: `SELECT SUM(total), DATE_TRUNC('hour', created_at) FROM bills GROUP BY 2` via `BillRepository`.

**Assessment:** The current Iterator + Singleton approach satisfies single-restaurant nightly reporting. SQL aggregation is needed at scale.

---

## Scenario 5: Multi-Screen Kitchen — Three Cooking Stations with Separate Queues

**Situation:** The kitchen is split into three stations: Starters, Mains, and Desserts. Each station has its own tablet showing only relevant orders.

**Current design response:**

The **Command** pattern's `KitchenQueue` currently uses a single Redis List (`kitchen:queue`). The extension is straightforward:

```java
// KitchenQueueRedisAdapter.java — multi-queue version
private String queueKey(String category) {
    return "kitchen:queue:" + category.toLowerCase();  // e.g. kitchen:queue:mains
}
```

Each `KitchenCommand` carries a `targetStation` field derived from the order items' categories. `KitchenQueue.execute()` routes to the correct Redis List.

The **Observer** pattern extension: a `StationDisplayObserver` is registered per station, subscribed to `notifications:kitchen:starters`, `notifications:kitchen:mains`, `notifications:kitchen:desserts` channels.

**Composite meal routing:** A `ComboMeal` containing a starter and a main would generate two commands (one per station). `ExpediteOrderCommand` at the station level only marks that station's component as ready; the order becomes globally `READY` only when all stations are complete — this requires an aggregate-ready check in `KitchenService`.

**Factory Method** determines station routing: `StarterFactory.getStation()` returns `"starters"`, `MainCourseFactory.getStation()` returns `"mains"`, etc.

**Assessment:** The multi-queue extension requires moderate `KitchenQueue` and `KitchenQueueRedisAdapter` changes but no pattern changes — the Command, Observer, and Factory Method abstractions accommodate the new routing logic cleanly.

---

## Summary Table

| Scenario | Primary Patterns Used | Change Scope |
|---|---|---|
| Kids' Meal category | Factory Method, Decorator | Low — 1 new class, 1 switch case |
| Reservation pipeline | State, Observer, Facade | Medium — new facade + scheduler |
| Franchise rollout | All patterns (scaling audit) | High — multi-tenancy, Singleton replaced |
| End-of-night report | Iterator, Singleton, Composite | Low — existing patterns sufficient |
| Multi-screen kitchen | Command, Observer, Factory | Medium — queue routing, station observers |
