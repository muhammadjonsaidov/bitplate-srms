# Task 5 — Reflective Journal

> **Unit 27 Advanced Programming — Y/615/1651**  
> Student: Muhammad Jon Saidov  
> ~450 words

---

## Reflective Journal: Building BitePlate SRMS

Starting this project, I understood design patterns as theoretical constructs — abstract diagrams in textbooks that seemed disconnected from real code. Building BitePlate SRMS changed that perception entirely.

The first genuine challenge came with the **State pattern** for `RestaurantTable`. My initial approach was a series of `if`/`switch` statements checking `table.getStatus()` before every transition. The code worked, but adding a new status meant hunting through six different service methods to find every conditional. When I refactored to `TableState` with concrete state classes (`FreeState`, `OccupiedState`, etc.), the illegal transition logic centralised into each state object. The moment I tried `freeTable.awaitBill()` and got an `IllegalStateException` immediately — without touching a service layer — I understood what "behaviour-driven by state" actually means in practice.

The **Singleton** caused the most debugging time. My first attempt used eager initialisation (`private static final OrderHistoryLog INSTANCE = new OrderHistoryLog()`), which worked until I wrote unit tests. The global state leaked between test methods — records appended in one test appeared in the next. I had to implement the volatile + double-checked locking pattern and expose a `resetForTest()` package-private method to make the test suite reliable. This taught me that Singleton convenience comes at a testability cost that must be explicitly managed.

The **Observer** pattern revealed a subtle JPA trap I had not anticipated. When Spring JPA reloads an `Order` entity from the database, it creates a fresh instance — the `transient List<OrderObserver>` is empty. My first end-to-end test failed silently because status updates fired to nobody. The fix — re-registering observers in `OrderService` after every reload — felt inelegant, and reinforced why frameworks like Spring's `ApplicationEventPublisher` exist: to decouple the observer lifecycle from the entity lifecycle.

The most satisfying moment was implementing the **Decorator** pattern for allergen flags. The requirement came up mid-development: a waiter should be warned when a menu item contains common allergens. Without the Decorator, this would have required a boolean column on `MenuItem` and conditional logic scattered across the display layer. With `AllergenFlagDecorator`, I wrapped the existing item in under five minutes: `new AllergenFlagDecorator(mainCourse, "gluten")`. The description automatically appended ⚠️ — zero changes to `MainCourse`, zero changes to the frontend rendering code.

If I were to rebuild this system, I would replace the in-memory `OrderHistoryLog` Singleton with a database-backed repository from the start, use Spring's event system instead of manual observer registration, and serialise `KitchenCommand` history to Redis for undo persistence across server restarts. These are not mistakes in the current implementation — they are deliberate simplifications appropriate to the deployment context — but they highlight how design decisions made early constrain or enable later evolution.

The project demonstrated that design patterns are not an academic checklist. They are answers to recurring problems that would otherwise be solved poorly, repeatedly, by different developers on the same team.

---
