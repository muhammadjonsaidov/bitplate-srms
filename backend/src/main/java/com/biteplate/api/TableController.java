package com.biteplate.api;

import com.biteplate.application.TableService;
import com.biteplate.domain.table.RestaurantTable;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Tag(name = "Tables")
@RestController
@RequestMapping("/api/tables")
@RequiredArgsConstructor
public class TableController {

    private final TableService tableService;

    @Operation(summary = "Get all tables with current status")
    @GetMapping
    public ResponseEntity<List<RestaurantTable>> getAllTables() {
        return ResponseEntity.ok(tableService.findAll());
    }

    @Operation(summary = "Get table by ID")
    @GetMapping("/{id}")
    public ResponseEntity<RestaurantTable> getTable(@PathVariable Long id) {
        return ResponseEntity.ok(tableService.findById(id));
    }

    @Operation(summary = "Seat customer at table — STATE: FREE → OCCUPIED")
    @PutMapping("/{id}/seat")
    public ResponseEntity<RestaurantTable> seatCustomer(@PathVariable Long id) {
        return ResponseEntity.ok(tableService.seatCustomer(id));
    }

    @Operation(summary = "Reserve table — STATE: FREE → RESERVED")
    @PutMapping("/{id}/reserve")
    public ResponseEntity<RestaurantTable> reserveTable(@PathVariable Long id) {
        return ResponseEntity.ok(tableService.reserveTable(id));
    }

    @Operation(summary = "Request bill — STATE: OCCUPIED → AWAITING_BILL")
    @PutMapping("/{id}/request-bill")
    public ResponseEntity<RestaurantTable> requestBill(@PathVariable Long id) {
        return ResponseEntity.ok(tableService.requestBill(id));
    }

    @Operation(summary = "Clear table — STATE: AWAITING_BILL → CLEARED → FREE")
    @PutMapping("/{id}/clear")
    public ResponseEntity<RestaurantTable> clearTable(@PathVariable Long id) {
        return ResponseEntity.ok(tableService.clearTable(id));
    }
}
