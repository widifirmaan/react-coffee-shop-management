package com.americano.coffeeshop.service.impl;

import com.americano.coffeeshop.dto.CreateEmployeeRequest;
import com.americano.coffeeshop.dto.EmployeeDTO;
import com.americano.coffeeshop.model.Employee;
import com.americano.coffeeshop.repository.EmployeeRepository;
import com.americano.coffeeshop.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.security.crypto.password.PasswordEncoder; // Assuming we use PasswordEncoder, checking imports later

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeServiceImpl implements EmployeeService {
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public List<EmployeeDTO> getAllEmployees() {
        return employeeRepository.findAll().stream()
                .map(EmployeeDTO::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    public EmployeeDTO addEmployee(CreateEmployeeRequest request) {
        Employee employee = request.toEntity();
        if (employee.getPassword() != null && !employee.getPassword().isEmpty()) {
            employee.setPassword(passwordEncoder.encode(employee.getPassword()));
        }
        // Ensure active is true by default
        employee.setActive(true);
        Employee saved = employeeRepository.save(employee);
        return EmployeeDTO.fromEntity(saved);
    }

    @Override
    public EmployeeDTO updateEmployee(String id, CreateEmployeeRequest request) {
        Employee existing = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        // Update fields
        // use request.toEntity() to get a temporary object or map manually
        // Mapping manually is safer to preserve other fields

        if (request.getName() != null)
            existing.setName(request.getName());
        if (request.getUsername() != null)
            existing.setUsername(request.getUsername());
        if (request.getEmployeeId() != null)
            existing.setEmployeeId(request.getEmployeeId());
        if (request.getRole() != null)
            existing.setRole(request.getRole());
        if (request.getPosition() != null)
            existing.setPosition(request.getPosition());
        if (request.getEmail() != null)
            existing.setEmail(request.getEmail());
        if (request.getPhone() != null)
            existing.setPhone(request.getPhone());
        if (request.getSalary() != null)
            existing.setSalary(request.getSalary());

        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            existing.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        Employee saved = employeeRepository.save(existing);
        return EmployeeDTO.fromEntity(saved);
    }

    @Override
    public EmployeeDTO toggleEmployeeStatus(String id) {
        Employee existing = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));

        if ("MANAGER".equalsIgnoreCase(existing.getRole())) {
            throw new RuntimeException("CANNOT FREEZE MANAGER");
        }

        boolean currentStatus = existing.getActive() == null || existing.getActive();
        existing.setActive(!currentStatus);
        Employee saved = employeeRepository.save(existing);
        return EmployeeDTO.fromEntity(saved);
    }
}
