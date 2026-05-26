package com.biteplate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * BitePlate Smart Restaurant Management System
 * Unit 27: Advanced Programming — BTEC Level 5
 *
 * Design patterns implemented:
 *  - Command    (KitchenQueue / KitchenCommand)
 *  - Singleton  (OrderHistoryLog)
 *  - Strategy   (PricingStrategy)
 *  - Observer   (OrderObserver / Redis Pub/Sub)
 *  - State      (TableState)
 *  - Factory    (MenuItemFactory)
 *  - Decorator  (MenuItemDecorator)
 *  - Facade     (BillingFacade)
 *  - Composite  (ComboMeal / MenuComponent)
 *  - Iterator   (OrderHistoryIterator)
 */
@SpringBootApplication
@EnableScheduling
public class BiteplateApplication {
    public static void main(String[] args) {
        SpringApplication.run(BiteplateApplication.class, args);
    }
}
