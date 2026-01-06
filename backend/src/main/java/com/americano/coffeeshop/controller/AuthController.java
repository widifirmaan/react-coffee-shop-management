package com.americano.coffeeshop.controller;

import com.americano.coffeeshop.dto.LoginRequest;
import com.americano.coffeeshop.model.Employee;
import com.americano.coffeeshop.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final EmployeeRepository employeeRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);

        Employee employee = employeeRepository.findByUsername(loginRequest.getUsername()).orElseThrow();
        // Don't return the password
        employee.setPassword(null);

        return ResponseEntity.ok(employee);
    }
}
