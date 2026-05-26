package com.biteplate.api;

import com.biteplate.application.MenuService;
import com.biteplate.domain.menu.MenuItem;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@Tag(name = "Menu")
@RestController
@RequestMapping("/api/menu")
@RequiredArgsConstructor
public class MenuController {

    private final MenuService menuService;

    public record CreateMenuItemRequest(
        @NotBlank String category,
        @NotBlank String name,
        String description,
        @DecimalMin("0.01") BigDecimal price
    ) {}

    @Operation(summary = "Get all available menu items")
    @GetMapping
    public ResponseEntity<List<MenuItem>> getMenu() {
        return ResponseEntity.ok(menuService.findAvailable());
    }

    @Operation(summary = "Search menu items by name")
    @GetMapping("/search")
    public ResponseEntity<List<MenuItem>> search(@RequestParam String q) {
        if (q == null || q.isBlank()) return ResponseEntity.ok(menuService.findAvailable());
        return ResponseEntity.ok(menuService.search(q));
    }

    @Operation(summary = "Get menu item by ID")
    @GetMapping("/{id}")
    public ResponseEntity<MenuItem> getItem(@PathVariable Long id) {
        return ResponseEntity.ok(menuService.findById(id));
    }

    @Operation(summary = "Create menu item using Factory Method [MANAGER only]")
    @PostMapping("/admin")
    @PreAuthorize("hasRole('MANAGER')")
    public ResponseEntity<MenuItem> createItem(@Valid @RequestBody CreateMenuItemRequest request) {
        MenuItem item = menuService.createMenuItem(
            request.category(), request.name(), request.description(), request.price()
        );
        return ResponseEntity.status(201).body(item);
    }

    @Operation(summary = "Toggle menu item availability [MANAGER, HEAD_CHEF]")
    @PatchMapping("/admin/{id}/availability")
    @PreAuthorize("hasAnyRole('MANAGER','HEAD_CHEF')")
    public ResponseEntity<MenuItem> toggleAvailability(
        @PathVariable Long id,
        @RequestParam boolean available
    ) {
        return ResponseEntity.ok(menuService.updateAvailability(id, available));
    }
}
