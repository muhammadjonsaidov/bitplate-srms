# BitePlate SRMS

**Smart Restaurant Management System** — full-stack monorepo demonstrating all 10 Gang-of-Four design patterns in a production-grade Spring Boot + React application.

[![Java](https://img.shields.io/badge/Java-21-orange)](https://openjdk.org/jeps/444)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.x-brightgreen)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-blue)](https://react.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Features

- **Table management** — real-time status board (Free / Reserved / Occupied / Awaiting Bill / Cleared)
- **Order lifecycle** — create, add items, submit to kitchen, track from prep to delivery
- **Kitchen queue** — live queue with prepare / expedite / undo actions
- **Billing** — auto-pricing by time of day, tip, split bill, VAT calculation
- **Allergen flagging** — decorator-based item annotations at order time
- **Role-based access** — Waiter / Chef / Cashier / Manager roles with JWT auth

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Backend** | Java 21 (Virtual Threads), Spring Boot 3.3.x, Gradle Kotlin DSL |
| **Database** | PostgreSQL 16 + Flyway migrations |
| **Cache / Queue** | Redis 7 — kitchen queue (List), notifications (Pub/Sub), refresh tokens |
| **Frontend** | React 18 + TypeScript + Vite + Tailwind CSS + shadcn/ui |
| **State** | Zustand (auth), TanStack Query v5 (server state, auto-polling) |
| **Auth** | JWT access token (in-memory) + refresh token (httpOnly cookie, Redis-backed) |
| **API Docs** | SpringDoc OpenAPI / Swagger UI |
| **Deployment** | Docker Compose + GitHub Actions → VPS |

---

## Language & IDE Choice

Java 21 was chosen as the implementation language because its object-oriented model maps directly onto the design patterns used throughout this system — sealed interfaces simplify exhaustive pattern matching in the State transitions, records reduce boilerplate in value objects like `OrderRecord`, and virtual threads (Project Loom) make Redis Pub/Sub notification handlers non-blocking without reactive overhead. Spring Boot 3.3 was selected because its dependency-injection container handles Singleton lifecycle management at the framework level, Spring Security integrates cleanly with JWT and role-based method guards, and SpringDoc generates live API documentation from annotations rather than maintaining a separate spec. PostgreSQL with Flyway was preferred over an in-memory database because schema migrations are versioned alongside the code, which keeps the domain model evolution auditable. TypeScript with React 18 and Vite was chosen for the frontend because strict typing catches API contract mismatches at compile time, and Vite's HMR keeps the development loop fast without a separate bundler configuration. IntelliJ IDEA Ultimate was used as the primary IDE: its Spring facet provides run configurations and bean wiring graphs out of the box, the built-in database client connects directly to the Dockerised PostgreSQL instance, and the PlantUML plugin renders UML source files in-editor so diagrams stay in sync with code changes without a separate tool.

---

## Design Patterns

| # | Pattern | Category | Implementation |
|---|---|---|---|
| 1 | **Command** | Behavioural | `KitchenQueue` invoker + `PrepareOrderCommand`, `ExpediteOrderCommand`, `CancelOrderCommand` — full undo support via `Deque` |
| 2 | **Observer** | Behavioural | `Order` subject notifies `WaiterNotifier`, `ManagerDashboard`, `KitchenDisplayObserver` via Redis Pub/Sub |
| 3 | **Strategy** | Behavioural | `PricingStrategy`: Standard / Happy Hour (20% off 15:00–17:00) / Loyalty Card (10% + £3 credit) — swapped at runtime |
| 4 | **State** | Behavioural | `RestaurantTable`: FREE → RESERVED → OCCUPIED → AWAITING_BILL → CLEARED — illegal transitions throw immediately |
| 5 | **Factory Method** | Creational | `MenuItemFactory.forCategory()` dispatches to `StarterFactory`, `MainCourseFactory`, `DessertFactory`, `BeverageFactory` |
| 6 | **Singleton** | Creational | `OrderHistoryLog` — volatile + double-checked locking, `CopyOnWriteArrayList` backing store |
| 7 | **Iterator** | Behavioural | `OrderHistoryIterator` — snapshot copy prevents `ConcurrentModificationException` during traversal |
| 8 | **Decorator** | Structural | `AllergenFlagDecorator`, `SpecialPrepDecorator`, `SubstitutionDecorator` wrap `MenuComponent` at order time |
| 9 | **Facade** | Structural | `BillingFacade` hides `TaxCalculator`, `TipHandler`, `SplitBillService`, `OrderHistoryLog` behind one entry point |
| 10 | **Composite** | Structural | `ComboMeal` contains `List<MenuComponent>` — individual items and nested combos treated uniformly |

---

## OOP Pillars

| Pillar | Where |
|---|---|
| **Encapsulation** | `price` is `protected` — no public setter; `passwordHash` excluded from all DTOs |
| **Inheritance** | `MenuItem` → `Starter`/`MainCourse`/`Dessert`/`Beverage`; `Staff` → `Waiter`/`Chef`/`Cashier`/`Manager` |
| **Polymorphism** | `getCategory()` overridden per subclass; `PricingStrategy.calculateTotal()` resolved at runtime |
| **Abstraction** | `abstract class MenuItem`, `abstract class Staff`, `abstract class MenuItemFactory` expose contracts, hide construction |

---

## Project Structure

```
bitplate-srms/
├── backend/
│   ├── src/main/java/com/biteplate/
│   │   ├── domain/          # Entities + all pattern classes
│   │   ├── application/     # Service layer
│   │   ├── api/             # REST controllers
│   │   ├── infrastructure/  # Redis adapters + JPA repositories
│   │   ├── security/        # JWT filter, token provider, refresh service
│   │   └── config/          # Security, Redis, OpenAPI config
│   └── src/main/resources/
│       ├── db/migration/    # V1__init_schema.sql, V2__seed_data.sql
│       └── application.yml
├── frontend/
│   └── src/
│       ├── pages/           # TablesPage, OrdersPage, KitchenPage, BillingPage, DashboardPage
│       ├── components/      # Layout, ProtectedRoute, Sidebar
│       ├── api/             # Axios client + per-domain modules
│       └── store/           # Zustand authStore
├── uml/                     # PlantUML source (.puml)
├── docs/                    # Written reports and evaluation
├── nginx/biteplate.conf
├── docker-compose.yml       # Dev environment
├── docker-compose.prod.yml  # Production
└── .github/workflows/deploy.yml
```

---

## Quick Start (Local)

**Prerequisites:** Java 21, Docker Compose, Node 20

```bash
# 1. Start Postgres + Redis
docker compose up -d postgres redis

# 2. Backend
cd backend
./gradlew bootRun

# 3. Frontend (new terminal)
cd frontend
npm install
npm run dev
```

| URL | Service |
|---|---|
| http://localhost:5173 | Frontend |
| http://localhost:8080 | Backend API |
| http://localhost:8080/swagger-ui.html | Swagger UI |

### Demo Credentials

| Username | Password | Role |
|---|---|---|
| `manager` | `manager123` | MANAGER |
| `chef1` | `chef123` | HEAD_CHEF |
| `waiter1` | `waiter123` | WAITER |
| `waiter2` | `waiter123` | WAITER |
| `cashier1` | `cashier123` | CASHIER |

> Seeded by `V2__seed_data.sql` — dev/demo only.

---

## Deployment

Self-hosted via Docker Compose + GitHub Actions. See [`github-config.md`](github-config.md) for:
- VPS setup and DNS configuration
- Required GitHub Secrets (`SERVER_HOST`, `SERVER_USER`, `SERVER_SSH_KEY`, `DB_PASS`, `JWT_SECRET`)
- SSL certificate setup with Certbot

```bash
# Production deploy (on server)
docker compose -f docker-compose.prod.yml up -d
```

---

## UML Diagrams

Source files in `uml/`. Render to PNG:

```bash
# Install PlantUML
sudo apt install plantuml

# Generate all
for f in uml/*.puml; do plantuml "$f"; done
```

Or use the [VS Code PlantUML extension](https://marketplace.visualstudio.com/items?itemName=jebbs.plantuml).

Diagrams included:
- `usecase.puml` — system use case diagram
- `sequence_order_lifecycle.puml` — full order lifecycle (all patterns visible)
- `class_diagram.puml` — complete system class diagram
- `class_command_pattern.puml` / `class_observer_pattern.puml` / `class_strategy_pattern.puml` — focused pattern diagrams
- `activity_order_lifecycle.puml` / `activity_history_query.puml` — swimlane activity diagrams

---

## License

MIT
