package com.biteplate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

/**
 * BitePlate — Smart Restaurant Management System
 *
 * Spring Boot 3.3 application providing table management, order lifecycle,
 * kitchen queue, billing, and real-time notifications via Redis Pub/Sub.
 */
@SpringBootApplication
@EnableScheduling
public class BiteplateApplication {
    public static void main(String[] args) {
        SpringApplication.run(BiteplateApplication.class, args);
    }
}
