package com.biteplate.infrastructure.persistence;

import com.biteplate.domain.reservation.Reservation;
import com.biteplate.domain.reservation.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByTableIdAndStatus(Long tableId, ReservationStatus status);
    List<Reservation> findByReservationTimeBetween(LocalDateTime from, LocalDateTime to);
    List<Reservation> findByStatusAndReservationTimeBefore(ReservationStatus status, LocalDateTime before);
}
