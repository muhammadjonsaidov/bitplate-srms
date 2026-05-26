# Task 3c — Critical Evaluation of Design Pattern Choices

> **Unit 27 Advanced Programming — Y/615/1651**  
> ~380 words

---

## Pattern Trade-offs in BitePlate SRMS

The ten design patterns implemented in BitePlate were chosen deliberately, but each introduces trade-offs that a production engineering team must consider.

The **Command pattern** in `KitchenQueue` provides undo capability at the cost of class proliferation — three separate command classes for what could be a single `setStatus()` call. The deeper cost is that `commandHistory` lives in JVM heap: a server restart loses undo history. For a single-restaurant deployment this is tolerable; at scale, commands would need serialisation to a persistent store. The benefit justifies the overhead: a chef who accidentally cancels the wrong order can undo with one click rather than requiring a manager database fix.

The **Singleton** in `OrderHistoryLog` is the most debated choice. Double-checked locking with `volatile` is correct for Java 5+ memory model, and `CopyOnWriteArrayList` prevents concurrent modification during iteration. However, Singleton global state is notoriously hostile to unit testing — the instance persists between test runs, polluting assertions. The mitigation is a package-private `resetForTest()` method, acceptable in an educational context. In a production microservices architecture, `OrderHistoryLog` would be entirely replaced by a dedicated persistence layer (`OrderHistoryRepository` backed by PostgreSQL), removing the Singleton entirely.

The **Observer** pattern creates a subtle JPA lifecycle problem: `Order.observers` is marked `transient`, meaning observers are lost when the entity is reloaded from the database. `OrderService` must re-register observers after every reload — an implicit contract that is easy to break. A more robust approach would use Spring's `ApplicationEventPublisher` instead of manual observer lists, as the event bus persists independently of the JPA entity lifecycle.

Scaling to fifty restaurants would expose the limitations most clearly. `OrderHistoryLog` as a Singleton assumes a single JVM — in a horizontally scaled deployment, each pod would have its own log instance, producing inconsistent history. The **Strategy** pattern scales trivially — new pricing rules require only a new class. The **State** pattern scales well too, but `@PostLoad` state reconstruction becomes expensive if tables are loaded in bulk (e.g., a manager dashboard requesting all 200 tables across a franchise). A DTO projection skipping `@PostLoad` restoration would be needed for bulk reads.

Overall, the patterns demonstrate sound OOP design for the single-restaurant scope. Production-grade scaling would require replacing Singleton with distributed state, Observer with a durable event bus, and Command history with persistent storage.

---
