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
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        System.out.println("DEBUG: Attempting to load user: " + username);
        Employee employee = employeeRepository.findByUsername(username)
                .orElseThrow(() -> {
                    System.out.println("DEBUG: User not found: " + username);
                    return new UsernameNotFoundException("User not found with username: " + username);
                });

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
