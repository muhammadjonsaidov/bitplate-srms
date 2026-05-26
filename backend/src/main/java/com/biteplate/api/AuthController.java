package com.biteplate.api;

import com.biteplate.application.StaffService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Arrays;
import java.util.Map;

@Tag(name = "Authentication")
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final StaffService staffService;

    public record LoginRequest(@NotBlank String username, @NotBlank String password) {}

    @Operation(summary = "Login with username and password")
    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(
        @Valid @RequestBody LoginRequest request,
        HttpServletResponse response
    ) {
        Map<String, Object> result = staffService.login(request.username(), request.password());

        // Store refresh token in httpOnly cookie
        Cookie cookie = new Cookie("refresh_token", (String) result.get("refreshToken"));
        cookie.setHttpOnly(true);
        cookie.setSecure(true);
        cookie.setPath("/api/auth/refresh");
        cookie.setMaxAge(7 * 24 * 3600);
        response.addCookie(cookie);

        return ResponseEntity.ok(Map.of(
            "accessToken", result.get("accessToken"),
            "staff", result.get("staff")
        ));
    }

    @Operation(summary = "Refresh access token using httpOnly cookie")
    @PostMapping("/refresh")
    public ResponseEntity<Map<String, Object>> refresh(
        HttpServletRequest request,
        @AuthenticationPrincipal UserDetails user
    ) {
        if (request.getCookies() == null) return ResponseEntity.status(401).build();
        String refreshToken = Arrays.stream(request.getCookies())
            .filter(c -> "refresh_token".equals(c.getName()))
            .findFirst()
            .map(Cookie::getValue)
            .orElseThrow(() -> new IllegalArgumentException("No refresh token"));

        String username = user != null ? user.getUsername() : extractUsernameFromCookie(refreshToken);
        return ResponseEntity.ok(staffService.refresh(username, refreshToken));
    }

    @Operation(summary = "Logout — invalidates refresh token")
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
        @AuthenticationPrincipal UserDetails user,
        HttpServletResponse response
    ) {
        if (user != null) staffService.logout(user.getUsername());
        Cookie cookie = new Cookie("refresh_token", "");
        cookie.setMaxAge(0);
        cookie.setPath("/api/auth/refresh");
        response.addCookie(cookie);
        return ResponseEntity.noContent().build();
    }

    private String extractUsernameFromCookie(String token) {
        // Minimal fallback — JwtAuthFilter handles this properly in production
        throw new IllegalStateException("Authentication required");
    }
}
