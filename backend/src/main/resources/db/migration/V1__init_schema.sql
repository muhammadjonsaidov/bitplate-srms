-- BitePlate SRMS — Initial Schema
-- V1: Core tables

CREATE TABLE staff (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('MANAGER','HEAD_CHEF','WAITER','CASHIER')),
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE restaurant_tables (
    id BIGSERIAL PRIMARY KEY,
    table_number INT NOT NULL UNIQUE,
    capacity INT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'FREE'
        CHECK (status IN ('FREE','RESERVED','OCCUPIED','AWAITING_BILL','CLEARED')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE menu_items (
    id BIGSERIAL PRIMARY KEY,
    dtype VARCHAR(20) NOT NULL CHECK (dtype IN ('STARTER','MAIN_COURSE','DESSERT','BEVERAGE')),
    name VARCHAR(150) NOT NULL,
    description TEXT,
    price NUMERIC(10,2) NOT NULL,
    available BOOLEAN NOT NULL DEFAULT TRUE,
    allergens TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE combo_meals (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    description TEXT,
    available BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE combo_meal_items (
    combo_meal_id BIGINT NOT NULL REFERENCES combo_meals(id) ON DELETE CASCADE,
    menu_item_id BIGINT NOT NULL REFERENCES menu_items(id),
    PRIMARY KEY (combo_meal_id, menu_item_id)
);

CREATE TABLE reservations (
    id BIGSERIAL PRIMARY KEY,
    table_id BIGINT NOT NULL REFERENCES restaurant_tables(id),
    customer_name VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20),
    party_size INT NOT NULL,
    reservation_time TIMESTAMP NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED'
        CHECK (status IN ('CONFIRMED','CANCELLED','COMPLETED')),
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE orders (
    id BIGSERIAL PRIMARY KEY,
    table_id BIGINT NOT NULL REFERENCES restaurant_tables(id),
    staff_id BIGINT NOT NULL REFERENCES staff(id),
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING','PREPARING','READY','SERVED','CANCELLED')),
    notes TEXT,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE order_items (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    menu_item_id BIGINT REFERENCES menu_items(id),
    combo_meal_id BIGINT REFERENCES combo_meals(id),
    quantity INT NOT NULL DEFAULT 1,
    unit_price NUMERIC(10,2) NOT NULL,
    customisations TEXT,
    allergen_flagged BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE TABLE bills (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL REFERENCES orders(id),
    subtotal NUMERIC(10,2) NOT NULL,
    tax NUMERIC(10,2) NOT NULL DEFAULT 0,
    tip NUMERIC(10,2) NOT NULL DEFAULT 0,
    total NUMERIC(10,2) NOT NULL,
    pricing_strategy VARCHAR(50) NOT NULL DEFAULT 'STANDARD',
    split_count INT NOT NULL DEFAULT 1,
    paid BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT NOW()
);

CREATE TABLE bill_line_items (
    id BIGSERIAL PRIMARY KEY,
    bill_id BIGINT NOT NULL REFERENCES bills(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,
    amount NUMERIC(10,2) NOT NULL
);

CREATE TABLE order_history_log (
    id BIGSERIAL PRIMARY KEY,
    order_id BIGINT NOT NULL,
    table_number INT NOT NULL,
    staff_id BIGINT NOT NULL,
    staff_name VARCHAR(100) NOT NULL,
    items_summary TEXT NOT NULL,
    total NUMERIC(10,2) NOT NULL,
    pricing_strategy VARCHAR(50) NOT NULL,
    recorded_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_orders_table ON orders(table_id);
CREATE INDEX idx_orders_staff ON orders(staff_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_order_history_recorded ON order_history_log(recorded_at);
CREATE INDEX idx_order_history_table ON order_history_log(table_number);
CREATE INDEX idx_reservations_table ON reservations(table_id);
CREATE INDEX idx_reservations_time ON reservations(reservation_time);
