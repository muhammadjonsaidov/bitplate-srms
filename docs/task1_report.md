# Task 1 — Written Report: BitePlate SRMS Design & Implementation

> **Unit 27 Advanced Programming — Y/615/1651**  
> Student: Muhammad Jon Saidov  
> System: BitePlate SRMS (Smart Restaurant Management System)

---

## 1. Object-Oriented Programming Concepts

### 1.1 Encapsulation

Encapsulation protects internal state by restricting direct field access and exposing controlled interfaces. In BitePlate, the `MenuItem` abstract class declares `price` as `protected`:

```java
// domain/menu/MenuItem.java
public abstract class MenuItem implements MenuComponent {
    protected BigDecimal price;

    @Override
    public BigDecimal getPrice() { return price; }

    // No public setPrice() — price set only via constructor/factory
}
```

The `Staff` hierarchy hides `passwordHash` entirely — it is never included in response DTOs. `RestaurantTable` encapsulates its state machine: external callers invoke `occupy()`, `awaitBill()`, `clear()` — they never manipulate `currentState` directly.

**Why it matters:** A junior developer cannot accidentally set `price = -5` or `status = OCCUPIED` without going through validated transitions. This reduces defect surface area in a team environment.

### 1.2 Inheritance

Inheritance models the *is-a* relationship between entity types, sharing structure while allowing specialisation.

**MenuItem hierarchy (Single-Table Inheritance):**
```java
// All stored in one DB table; dtype discriminates
@Entity @Table(name="menu_items")
@Inheritance(strategy = InheritanceType.SINGLE_TABLE)
@DiscriminatorColumn(name="dtype")
public abstract class MenuItem implements MenuComponent {
    public abstract String getCategory();
}

@Entity @DiscriminatorValue("MAIN_COURSE")
public class MainCourse extends MenuItem {
    @Override public String getCategory() { return "MAIN_COURSE"; }
}
```

**Staff hierarchy:** `WaiterStaff`, `ChefStaff`, `CashierStaff`, `ManagerStaff` all extend `Staff`, overriding `getPermissions()` to return role-specific access lists. Spring Security then builds authority sets from those permissions.

Inheritance reduces duplication: `id`, `name`, `passwordHash`, and `fullName` are defined once in `Staff` and reused across all four roles.

### 1.3 Polymorphism

Polymorphism allows objects of different types to be treated through a common interface, with behaviour resolved at runtime.

**Runtime polymorphism — PricingStrategy:**
```java
// BillingFacade holds the interface reference:
private PricingStrategy pricingStrategy;

// At runtime, BillingService injects the correct concrete class:
BigDecimal subtotal = pricingStrategy.calculateTotal(order);
// Calls StandardPricingStrategy.calculateTotal()  OR
//       HappyHourPricingStrategy.calculateTotal()  OR
//       LoyaltyCardPricingStrategy.calculateTotal()
// — without BillingFacade knowing which.
```

**Compile-time polymorphism (method overloading):** `OrderHistoryLog.append()` is overloaded to accept either a full `OrderRecord` or individual field parameters, selecting the correct variant at compile time.

**MenuComponent polymorphism:** `ComboMeal.getPrice()` calls `component.getPrice()` on each child — which may itself be a `MainCourse`, a `Beverage`, or another `ComboMeal` (Composite pattern). The recursive sum is possible because all types share the `MenuComponent` interface.

### 1.4 Abstraction

Abstraction hides complexity behind simplified interfaces.

`MenuItemFactory` declares the factory contract:
```java
public abstract class MenuItemFactory {
    // Public interface — what callers use
    public static MenuItemFactory forCategory(String category) { ... }
    public abstract MenuItem createAndValidate(String name, BigDecimal price);

    // Hidden complexity — validation only visible to subclasses
    protected void validate(MenuItem item) {
        if (item.getPrice().compareTo(BigDecimal.ZERO) <= 0)
            throw new IllegalArgumentException("Price must be positive");
    }
}
```

`BillingFacade` abstracts the entire billing subsystem. Callers invoke `generateBill(order, "STANDARD")` — they have no knowledge of `TaxCalculator`, `TipHandler`, `SplitBillService`, `OrderHistoryLog`, or the `PricingStrategy` selection logic.

---

## 2. Class Relationships

### 2.1 Relationship Types in BitePlate

| Relationship | Example | UML Notation |
|---|---|---|
| **Inheritance** | `MainCourse` extends `MenuItem` | Solid line, hollow triangle |
| **Realisation** | `Order` implements `OrderSubject` | Dashed line, hollow triangle |
| **Composition** | `BillingFacade` owns `TaxCalculator` | Filled diamond |
| **Aggregation** | `KitchenQueue` holds `List<KitchenCommand>` | Hollow diamond |
| **Association** | `Order` references `RestaurantTable` via `tableId` | Solid line |
| **Dependency** | `OrderService` uses `MenuItemFactory` | Dashed arrow |

### 2.2 Multiplicities

- `Order` (1) → `OrderItem` (0..*): one order, many items
- `BillingFacade` (1) → `PricingStrategy` (1): exactly one strategy active at a time
- `ComboMeal` (1) → `MenuComponent` (0..*): zero or more children (composite)
- `Order` (1) → `OrderObserver` (0..*): observers registered at order creation
- `RestaurantTable` (1) → `TableState` (1): exactly one active state

### 2.3 Open/Closed Principle

The codebase is designed to be open for extension, closed for modification:
- Adding a new menu category: create `SaladFactory extends MenuItemFactory` — zero changes to existing code
- Adding a new pricing model: implement `PricingStrategy` — `BillingFacade` needs no changes
- Adding a new order observer: implement `OrderObserver`, register in `OrderService` — `Order` unchanged

---

## 3. Design Pattern Analysis

### 3.1 Command Pattern

**Intent:** Encapsulate kitchen actions as objects, enabling undo, logging, and deferred execution.

**Implementation:**
```java
// KitchenQueue.java (Invoker)
public void execute(KitchenCommand cmd) {
    cmd.execute();                              // perform action
    commandHistory.push(cmd);                   // record for undo
    redisAdapter.push(cmd.getDescription());    // persist to Redis List
}

public KitchenCommand undoLast() {
    KitchenCommand cmd = commandHistory.pop();
    cmd.undo();                                 // revert to previousStatus
    return cmd;
}
```

**Trade-offs:**
- ✅ Undo is trivial — `previousStatus` stored in command object
- ✅ Commands can be serialised, queued, replayed
- ❌ Proliferation of small classes — one class per kitchen action
- ❌ `commandHistory` is in-memory — lost on server restart (Redis queue survives, but undo history does not)

**Mitigation:** For production, serialise `commandHistory` to Redis. For this assignment scope, in-memory is sufficient.

### 3.2 Observer Pattern

**Intent:** Notify multiple subsystems when order status changes, without coupling Order to its consumers.

**Implementation:**
```java
// Order.java (Subject)
public void updateStatus(OrderStatus status) {
    this.status = status;
    notifyObservers();          // push to all registered observers
}

private void notifyObservers() {
    observers.forEach(o -> o.onOrderStatusChanged(this, this.status));
}
```

Observers publish to Redis Pub/Sub channels, allowing future WebSocket push to browser clients without modifying the observer interface.

**Trade-offs:**
- ✅ Decoupled — Order knows nothing about WaiterNotifier's implementation
- ✅ Easy to add observers (e.g., SMS notification) without touching Order
- ❌ Observers stored as transient fields — lost when JPA reloads entity from DB; must re-register via `OrderService`
- ❌ No guaranteed delivery — if Redis is down, notifications are dropped (mitigated by polling fallback in frontend)

### 3.3 Strategy Pattern

**Intent:** Select pricing algorithm at runtime without modifying the billing engine.

**Implementation:**
```java
// BillingService.java
private PricingStrategy selectStrategy(String name) {
    LocalTime now = LocalTime.now();
    return switch (name.toUpperCase()) {
        case "HAPPY_HOUR" -> new HappyHourPricingStrategy();
        case "LOYALTY"    -> new LoyaltyCardPricingStrategy();
        default -> (now.isAfter(LocalTime.of(15,0)) && now.isBefore(LocalTime.of(17,0)))
                   ? new HappyHourPricingStrategy()
                   : new StandardPricingStrategy();
    };
}
```

**Trade-offs:**
- ✅ Adding `FranchiseDiscountStrategy` requires zero changes to `BillingFacade`
- ✅ Strategies are stateless — safe to share or instantiate per-request
- ❌ If Happy Hour detection logic needs to change (e.g., per-restaurant hours), `BillingService` needs editing — a resolver abstraction would fix this
- ❌ Strategy selection string is stringly-typed — `"HAPYHOUR"` silently falls back to Standard; an enum would be safer

### 3.4 State Pattern

**Intent:** Encode table lifecycle as state objects, making illegal transitions compile-time or runtime safe.

```java
// FreeState.java
public class FreeState implements TableState {
    @Override
    public void awaitBill(RestaurantTable t) {
        throw new IllegalStateException("Table is FREE — cannot request bill");
    }
    @Override
    public void occupy(RestaurantTable t) {
        t.setStatus(TableStatus.OCCUPIED);
        t.setCurrentState(new OccupiedState());
    }
}
```

`@PostLoad` reconstructs the transient state object from the persisted `TableStatus` enum after JPA loads the entity — bridging the ORM/state-object impedance mismatch.

**Trade-offs:**
- ✅ Invalid transitions throw immediately with meaningful messages
- ✅ Adding `CLEANING` state requires only one new class + modifications to adjacent states
- ❌ `@PostLoad` reconstruction is implicit — developers unfamiliar with the pattern may overlook it

### 3.5 Factory Method Pattern

**Intent:** Delegate menu item creation to category-specific factories, centralising validation.

**Trade-offs:**
- ✅ `MenuService` never calls `new MainCourse()` directly — all creation goes through validated factory
- ✅ Each factory can enforce category-specific rules (e.g., `BeverageFactory` may restrict price to £0.50–£15.00)
- ❌ Adding a new category (e.g., `DESSERT_SPECIAL`) requires a new factory class *and* a `switch` branch in `forCategory()`

### 3.6 Singleton Pattern

**Intent:** Ensure `OrderHistoryLog` has exactly one instance shared across all subsystems.

**Trade-offs:**
- ✅ All billing events captured in a single, consistent log regardless of which thread appended
- ✅ `CopyOnWriteArrayList` makes reads (iteration) safe without locking
- ❌ Hard to unit test — Singleton global state leaks between tests; solution: reset via reflection in `@BeforeEach`
- ❌ Single instance is a bottleneck at scale — for 50 restaurants, replace with a dedicated `OrderHistoryRepository` (database-backed)

### 3.7 Iterator Pattern

**Intent:** Traverse order history without exposing the underlying collection.

The snapshot copy in `OrderHistoryIterator` prevents `ConcurrentModificationException` if new records are appended during iteration — critical in a multithreaded server.

### 3.8 Decorator Pattern

**Intent:** Add allergen flags, special prep surcharges, or ingredient substitutions to menu items without altering the item class.

**Trade-offs:**
- ✅ Decorators compose: `new AllergenFlagDecorator(new SpecialPrepDecorator(item, £2.00), "gluten")`
- ❌ Deeply nested decorators are hard to debug — `item.getClass()` returns the outermost wrapper, not `MainCourse`

### 3.9 Facade Pattern

**Intent:** `BillingFacade` provides a single, simple entry point to the complex billing subsystem.

REST controllers call `billingFacade.generateBill(order, strategy)` — six internal steps happen transparently. This also means the billing internals can be refactored (e.g., swap `TaxCalculator` for a tax API) without touching any controller.

### 3.10 Composite Pattern

**Intent:** Treat individual items and combo meals uniformly via `MenuComponent`.

```java
// ComboMeal.java
public BigDecimal getPrice() {
    return items.stream()
        .map(MenuComponent::getPrice)
        .reduce(BigDecimal.ZERO, BigDecimal::add);
}
```

A `ComboMeal` can contain other `ComboMeal`s (e.g., a "Family Feast" containing a "Couple's Set"). `BillingFacade` calls `item.getPrice()` without knowing whether it is a leaf or composite.

---

## 4. Critical Evaluation of Pattern Choices

### Why Command over a simple status update?

A plain `orderService.setStatus(PREPARING)` is simpler to write, but provides no undo path. In a busy kitchen, a chef accidentally pressing "Cancel" on the wrong order is a real operational risk. Command encapsulates the state before the action, making one-click undo a first-class feature rather than a manual database fix.

### Why Observer over polling?

Polling (frontend requests `/orders/{id}` every N seconds) is simple but wastes bandwidth and introduces latency. Observer + Redis Pub/Sub pushes notifications exactly when status changes — 0ms latency vs. up to N seconds for polling. The frontend still polls as a fallback (TanStack Query `refetchInterval`), but the primary path is event-driven.

### Singleton testability concern

The double-checked locking Singleton is difficult to reset between unit tests. A pragmatic solution for test environments is to expose a package-private `resetInstance()` method annotated `@VisibleForTesting`, called in `@BeforeEach`. In a microservices context, `OrderHistoryLog` would be replaced entirely by a `POST /history` call to a dedicated history service.

### Decorator vs. database flags

Allergen information could be stored as database columns (`boolean glutenFlag`, `boolean nutsFlag`). The Decorator approach was chosen because:
1. New allergens require zero schema changes — just a new decorator
2. Decorators compose with `SpecialPrepDecorator` (a dish can be allergen-flagged *and* have a surcharge)
3. It demonstrates pattern proficiency as required by the assessment

---

## 5. Open-Ended Questions

**Q1: How would the system handle 500 concurrent orders during a lunch rush?**

Java 21 virtual threads (`spring.threads.virtual.enabled=true`) allow thousands of concurrent requests on a single JVM instance without traditional thread pool exhaustion. Each incoming request gets a virtual thread — blocking I/O (Postgres queries, Redis calls) parks the virtual thread rather than blocking an OS thread. Redis pipeline batching could further reduce round-trips for bulk order updates.

**Q2: If a new pricing tier (e.g., Staff Discount) were required, what would change?**

Only one addition required: `StaffDiscountPricingStrategy implements PricingStrategy`. No changes to `BillingFacade`, `Bill`, or any controller. `BillingService.selectStrategy()` gains one new `case "STAFF_DISCOUNT"` branch. This demonstrates the Open/Closed Principle in practice.

**Q3: How would you extend the State pattern to support table reservations with time-based auto-expiry?**

`ReservedState` would hold a `reservationExpiry : LocalDateTime`. A Spring `@Scheduled` task would query all `RESERVED` tables and call `table.expire()` on any where `now() > expiry`. `ReservedState.expire()` would transition back to `FreeState` and fire an event. The `TableState` interface gains one method: `expire(RestaurantTable t)` — all other states implement it as a no-op.

**Q4: What are the trade-offs of Single-Table Inheritance for MenuItem vs. a Table-Per-Class approach?**

Single-Table: one SQL query to fetch all menu items — no joins, high read performance. Cost: nullable columns for category-specific fields; table grows wide. Table-Per-Class: each subclass has its own table with only its columns — cleaner schema, but `SELECT * FROM menu_items` requires a UNION across 4 tables. Given the small number of category-specific fields in BitePlate, Single-Table is the right choice.

**Q5: How would the Observer pattern scale if 10,000 restaurants each had their own notification streams?**

Per-restaurant Redis Pub/Sub channels (`notifications:restaurant:{id}:waiter`) would partition traffic. However, 10,000 restaurants × 3 channels = 30,000 Redis pub/sub channels is well within Redis's limits (millions of channels supported). For very high throughput, replace Redis Pub/Sub with Apache Kafka — topics per restaurant, consumer groups per role, guaranteed delivery, message replay. The `OrderObserver` interface would remain unchanged — only `RedisNotificationPublisher` is swapped for `KafkaNotificationPublisher`.

---

## References

- Gamma, E., Helm, R., Johnson, R., Vlissides, J. (1994). *Design Patterns: Elements of Reusable Object-Oriented Software*. Addison-Wesley.
- Horstmann, C. (2022). *Core Java, Volume I: Fundamentals* (12th ed.). Oracle Press.
- Spring Framework Documentation. (2024). *Spring Boot Reference*. https://docs.spring.io/spring-boot/docs/3.3.x/reference/html/
- JEP 444: Virtual Threads. (2023). OpenJDK. https://openjdk.org/jeps/444
- Fowler, M. (2002). *Patterns of Enterprise Application Architecture*. Addison-Wesley.
