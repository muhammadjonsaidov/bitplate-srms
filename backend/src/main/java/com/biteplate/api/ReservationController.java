package com.biteplate.api;

import com.biteplate.application.ReservationService;
import com.biteplate.domain.reservation.Reservation;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@Tag(name = "Reservations", description = "Table reservation management")
@RestController
@RequestMapping("/api/reservations")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;

    @Operation(summary = "Get all reservations")
    @GetMapping
    @PreAuthorize("hasAnyRole('WAITER','MANAGER')")
    public List<Reservation> getAll() {
        return reservationService.getAll();
    }

    @Operation(summary = "Get reservations by date range")
    @GetMapping("/range")
    @PreAuthorize("hasAnyRole('WAITER','MANAGER')")
    public List<Reservation> getByRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to) {
        return reservationService.getByDateRange(from, to);
    }

    @Operation(summary = "Create a reservation (State Pattern: FREE → RESERVED)")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @PreAuthorize("hasAnyRole('WAITER','MANAGER')")
    public Reservation create(@Valid @RequestBody CreateReservationRequest req) {
        return reservationService.createReservation(
                req.getTableId(),
                req.getCustomerName(),
                req.getCustomerPhone(),
                req.getPartySize(),
                req.getScheduledAt());
    }

    @Operation(summary = "Customer arrives — check in (State Pattern: RESERVED → OCCUPIED)")
    @PutMapping("/{id}/check-in")
    @PreAuthorize("hasAnyRole('WAITER','MANAGER')")
    public Reservation checkIn(@PathVariable Long id) {
        return reservationService.checkIn(id);
    }

    @Operation(summary = "Cancel reservation (State Pattern: RESERVED → FREE)")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @PreAuthorize("hasAnyRole('WAITER','MANAGER')")
    public void cancel(@PathVariable Long id) {
        reservationService.cancelReservation(id);
    }

    // ─── Inner DTO ───────────────────────────────────────────────────────────

    @Data
    public static class CreateReservationRequest {
        @NotNull
        private Long tableId;

        @NotBlank
        private String customerName;

        private String customerPhone;

        @Min(1)
        private int partySize;

        @NotNull
        private LocalDateTime scheduledAt;
    }
}
