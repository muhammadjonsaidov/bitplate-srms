-- BitePlate SRMS — Seed Data
-- V2: Default staff, menu items, and tables

-- Staff (passwords are BCrypt of shown value)
-- manager123, waiter123, chef123, cashier123
INSERT INTO staff (name, username, password, role) VALUES
('Admin Manager',  'manager',  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQyCgZvnNqhZ.R2TkjB2xNNWi', 'MANAGER'),
('Head Chef Mario','chef1',    '$2a$12$eImiTXuWVxfM37uY4JANjQ..0aVEhNQQ1bHcKkSIAXVBdHmjM7U0i', 'HEAD_CHEF'),
('Waiter Alice',   'waiter1',  '$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL56lXWa', 'WAITER'),
('Cashier Bob',    'cashier1', '$2a$12$divuSR1DwEVQXgYuPGj8G.0J6eL3xQoC0Mz13N4X2XiUYNqlxm92', 'CASHIER'),
('Waiter Tom',     'waiter2',  '$2a$12$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7p92ldGxad68LJZdL56lXWa', 'WAITER');

-- Restaurant Tables
INSERT INTO restaurant_tables (table_number, capacity) VALUES
(1, 2), (2, 2), (3, 4), (4, 4), (5, 4),
(6, 6), (7, 6), (8, 8), (9, 8), (10, 10);

-- Starters
INSERT INTO menu_items (dtype, name, description, price, allergens) VALUES
('STARTER', 'Garlic Bread',       'Toasted ciabatta with garlic butter',              3.50,  'gluten,dairy'),
('STARTER', 'Caesar Salad',       'Romaine lettuce, croutons, parmesan, caesar dressing', 7.50, 'gluten,dairy,eggs'),
('STARTER', 'Soup of the Day',    'Ask your waiter for today''s soup',                5.00,  NULL),
('STARTER', 'Chicken Wings',      '6 crispy wings with dipping sauce',                8.50,  NULL),
('STARTER', 'Prawn Cocktail',     'King prawns, marie rose sauce, iceberg lettuce',   9.00,  'shellfish');

-- Main Courses
INSERT INTO menu_items (dtype, name, description, price, allergens) VALUES
('MAIN_COURSE', 'Grilled Salmon',     'Atlantic salmon fillet, seasonal vegetables, new potatoes', 18.50, 'fish'),
('MAIN_COURSE', 'Ribeye Steak',       '10oz ribeye, chips, mushroom, tomato',                      28.00, NULL),
('MAIN_COURSE', 'Chicken Tikka Masala','Tender chicken in creamy tomato sauce, basmati rice, naan', 14.50, 'gluten,dairy'),
('MAIN_COURSE', 'Veggie Burger',      'Plant-based patty, brioche bun, fries',                     13.00, 'gluten'),
('MAIN_COURSE', 'Seafood Linguine',   'Prawns, mussels, squid in tomato-white wine sauce',         19.50, 'shellfish,fish,gluten'),
('MAIN_COURSE', 'Lamb Chops',        'Two grilled lamb chops, mint jelly, roasted vegetables',    24.00, NULL);

-- Desserts
INSERT INTO menu_items (dtype, name, description, price, allergens) VALUES
('DESSERT', 'Chocolate Lava Cake', 'Warm chocolate cake, vanilla ice cream',      7.50,  'gluten,dairy,eggs'),
('DESSERT', 'Cheesecake',         'New York style, berry compote',                6.50,  'gluten,dairy,eggs'),
('DESSERT', 'Crème Brûlée',       'Classic French custard with caramel top',      6.00,  'dairy,eggs'),
('DESSERT', 'Ice Cream (3 scoops)','Choice of vanilla, chocolate, strawberry',    5.00,  'dairy');

-- Beverages
INSERT INTO menu_items (dtype, name, description, price, allergens) VALUES
('BEVERAGE', 'Still Water (500ml)',   'Mineral water',          2.00, NULL),
('BEVERAGE', 'Sparkling Water (500ml)','Sparkling mineral water',2.50, NULL),
('BEVERAGE', 'Coca Cola',            'Classic Coke 330ml can',  3.00, NULL),
('BEVERAGE', 'Fresh Orange Juice',   'Freshly squeezed, 250ml', 3.50, NULL),
('BEVERAGE', 'House Wine (glass)',   'Red or white, 175ml',     6.00, 'sulphites'),
('BEVERAGE', 'Craft Beer',           'Local IPA, 500ml',        5.50, 'gluten'),
('BEVERAGE', 'Espresso',             'Double shot espresso',    2.80, 'dairy'),
('BEVERAGE', 'Cappuccino',           'Espresso, steamed milk, foam', 3.50, 'dairy');
