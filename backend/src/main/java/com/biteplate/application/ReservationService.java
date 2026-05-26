package com.biteplate.application;

import com.biteplate.domain.reservation.Reservation;
import com.biteplate.domain.reservation.ReservationStatus;
import com.biteplate.domain.table.RestaurantTable;
import com.biteplate.infrastructure.persistence.ReservationRepository;
import com.biteplate.infrastructure.persistence.TableRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final TableRepository tableRepository;
    private final TableService tableService;

    /**
     * Create a new reservation. Table transitions to RESERVED via State Pattern.
     */
    @Transactional
    public Reservation createReservation(Long tableId, String customerName,
                                          String customerPhone, int partySize,
                                          LocalDateTime scheduledAt) {
        RestaurantTable table = tableRepository.findById(tableId)
                .orElseThrow(() -> new IllegalArgumentException("Table not found: " + tableId));

        if (table.getCapacity() < partySize) {
            throw new IllegalStateException(
                    "Table capacity (" + table.getCapacity() + ") insufficient for party of " + partySize);
        }

        // Transition table to RESERVED via State Pattern
        tableService.reserveTable(tableId);

        Reservation reservation = new Reservation(table, customerName, customerPhone, partySize, scheduledAt);
        Reservation saved = reservationRepository.save(reservation);
        log.info("Reservation #{} created for table {} at {}", saved.getId(), tableId, scheduledAt);
        return saved;
    }

    /**
     * Cancel a reservation and return the table to FREE state.
     */
    @Transactional
    public void cancelReservation(Long reservationId) {
        Reservation reservation = findById(reservationId);
        reservation.setStatus(ReservationStatus.CANCELLED);
        reservationRepository.save(reservation);

        try {
            tableService.clearTable(reservation.getTable().getId());
        } catch (Exception e) {
            log.warn("Table clear after cancel failed for reservation #{}: {}", reservationId, e.getMessage());
        }
        log.info("Reservation #{} cancelled", reservationId);
    }

    /**
     * Customer arrives — table transitions RESERVED → OCCUPIED via State Pattern.
     */
    @Transactional
    public Reservation checkIn(Long reservationId) {
        Reservation reservation = findById(reservationId);
        if (reservation.getStatus() != ReservationStatus.CONFIRMED) {
            throw new IllegalStateException("Cannot check in reservation with status: " + reservation.getStatus());
        }
        reservation.setStatus(ReservationStatus.ARRIVED);
        tableService.seatCustomer(reservation.getTable().getId());
        Reservation updated = reservationRepository.save(reservation);
        log.info("Reservation #{} checked in, table {} now OCCUPIED",
                reservationId, reservation.getTable().getId());
        return updated;
    }

    public Reservation findById(Long id) {
        return reservationRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Reservation not found: " + id));
    }

    public List<Reservation> getAll() {
        return reservationRepository.findAll();
    }

    public List<Reservation> getByDateRange(LocalDateTime from, LocalDateTime to) {
        return reservationRepository.findByReservationTimeBetween(from, to);
    }

    /**
     * Auto-expire confirmed reservations where scheduled time passed 15 minutes ago.
     * Runs every minute via @Scheduled.
     */
    @Scheduled(fixedDelay = 60_000)
    @Transactional
    public void expireStaleReservations() {
        LocalDateTime threshold = LocalDateTime.now().minusMinutes(15);
        List<Reservation> stale = reservationRepository
                .findByStatusAndReservationTimeBefore(ReservationStatus.CONFIRMED, threshold);

        stale.forEach(r -> {
            r.setStatus(ReservationStatus.EXPIRED);
            reservationRepository.save(r);
            try {
                tableService.clearTable(r.getTable().getId());
            } catch (Exception e) {
                log.warn("Could not clear table {} for expired reservation #{}: {}",
                        r.getTable().getId(), r.getId(), e.getMessage());
            }
            log.info("Reservation #{} expired for table {}", r.getId(), r.getTable().getId());
        });
    }
}
