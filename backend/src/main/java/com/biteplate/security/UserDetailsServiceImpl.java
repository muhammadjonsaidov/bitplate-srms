package com.biteplate.security;

import com.biteplate.domain.staff.Staff;
import com.biteplate.infrastructure.persistence.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserDetailsServiceImpl implements UserDetailsService {

    private final StaffRepository staffRepository;

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Staff staff = staffRepository.findByUsername(username)
            .orElseThrow(() -> new UsernameNotFoundException("Staff not found: " + username));

        return User.builder()
            .username(staff.getUsername())
            .password(staff.getPassword())
            .authorities(List.of(new SimpleGrantedAuthority("ROLE_" + staff.getRole().name())))
            .accountExpired(false)
            .credentialsExpired(false)
            .disabled(!staff.isActive())
            .build();
    }
}
