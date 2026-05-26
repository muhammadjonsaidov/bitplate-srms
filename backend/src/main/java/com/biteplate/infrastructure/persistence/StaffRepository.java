package com.biteplate.infrastructure.persistence;

import com.biteplate.domain.staff.Staff;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface StaffRepository extends JpaRepository<Staff, Long> {
    Optional<Staff> findByUsername(String username);
    boolean existsByUsername(String username);
}
