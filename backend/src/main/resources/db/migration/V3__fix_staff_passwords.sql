-- V3: Fix BCrypt password hashes (V2 hashes were generated incorrectly)
UPDATE staff SET password = '$2b$12$tesekUotefyIi9QugF1zXe/cRno7lziIGeF6Ezkk6FKsnqpDPB5im' WHERE username = 'manager';
UPDATE staff SET password = '$2b$12$E/ToOOwmuIcBF04Jt8bRCuKiEPXKTVUXXfFEeLgcsJOHOcVAEFoeu' WHERE username = 'chef1';
UPDATE staff SET password = '$2b$12$KRzVXIJED3NeMZiAlpp9kePE7ybhN.BV5ggjA3prILJqO7vjoeR/S' WHERE username = 'waiter1';
UPDATE staff SET password = '$2b$12$vnWegzEVsxDtBuvHB5PETOfWBgwDBr96wkJp2XWm/uCzqxpxAdL7a' WHERE username = 'waiter2';
UPDATE staff SET password = '$2b$12$Uce9IXiiS6o/neXV08awn.3ehgTgcIL6n0s/m8g9o0TokuWy8eEG2' WHERE username = 'cashier1';
