package com.americano.coffeeshop.security;

import com.americano.coffeeshop.model.Employee;
import com.americano.coffeeshop.repository.EmployeeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    @Autowired
    private EmployeeRepository employeeRepository;

    @Override
    public UserDetails loadUserByUsername(String usernameOrEmail) throws UsernameNotFoundException {
        System.out.println("DEBUG: Attempting to load user: " + usernameOrEmail);

        Employee employee = employeeRepository.findByUsernameOrEmail(usernameOrEmail, usernameOrEmail)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with identifier: " + usernameOrEmail));

        // Business Rule: If the user provided a username (no @), they MUST be a manager
        if (!usernameOrEmail.contains("@") && !"manager".equalsIgnoreCase(employee.getRole())) {
            throw new UsernameNotFoundException("Non-manager staff must login with Email.");
        }

        System.out.println("DEBUG: User found: " + employee.getUsername());
        System.out.println("DEBUG: Stored Encoded Password: " + employee.getPassword());

        return User.builder()
                .username(employee.getUsername())
                .password(employee.getPassword())
                .roles(employee.getRole())
                .disabled(Boolean.FALSE.equals(employee.getActive())) // Block login if inactive
                .accountExpired(Boolean.FALSE.equals(employee.getActive())) // Treat inactive as expired too for safety
                .accountLocked(Boolean.FALSE.equals(employee.getActive())) // Treat inactive as locked
                .build();
    }
}
