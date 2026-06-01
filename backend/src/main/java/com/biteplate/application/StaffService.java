package com.biteplate.application;

import com.biteplate.domain.staff.Staff;
import com.biteplate.infrastructure.persistence.StaffRepository;
import com.biteplate.security.JwtTokenProvider;
import com.biteplate.security.RefreshTokenService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
@RequiredArgsConstructor
public class StaffService {

    private final StaffRepository staffRepository;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final RefreshTokenService refreshTokenService;

    /**
     * ENCAPSULATION — authentication detail hidden; callers receive tokens only.
     */
    public Map<String, Object> login(String username, String password) {
        Authentication auth = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(username, password)
        );

        Staff staff = staffRepository.findByUsername(username)
            .orElseThrow(() -> new IllegalStateException("Staff not found after auth"));

        String accessToken = tokenProvider.generateAccessToken(username, staff.getRole().name());
        String refreshToken = refreshTokenService.createRefreshToken(username);

        return Map.of(
            "accessToken", accessToken,
            "refreshToken", refreshToken,
            "staff", Map.of(
                "id", staff.getId(),
                "name", staff.getName(),
                "username", staff.getUsername(),
                "role", staff.getRole(),
                "active", staff.isActive()
            )
        );
    }

    public Map<String, Object> refresh(String username, String refreshToken) {
        if (!refreshTokenService.validateRefreshToken(username, refreshToken)) {
            throw new IllegalArgumentException("Invalid or expired refresh token");
        }
        Staff staff = staffRepository.findByUsername(username)
            .orElseThrow(() -> new IllegalStateException("Staff not found"));

        String newAccessToken = tokenProvider.generateAccessToken(username, staff.getRole().name());
        return Map.of("accessToken", newAccessToken, "staff", staff);
    }

    public void logout(String username) {
        refreshTokenService.invalidate(username);
    }

    public Staff findByUsername(String username) {
        return staffRepository.findByUsername(username)
            .orElseThrow(() -> new IllegalArgumentException("Staff not found: " + username));
    }
}
