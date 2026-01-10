package com.americano.coffeeshop.controller;

import com.americano.coffeeshop.dto.CreateEmployeeRequest;
import com.americano.coffeeshop.dto.EmployeeDTO;
import com.americano.coffeeshop.service.EmployeeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/employees")
@RequiredArgsConstructor
public class EmployeeController {
    private final EmployeeService employeeService;

    @GetMapping
    public List<EmployeeDTO> getAllEmployees() {
        return employeeService.getAllEmployees();
    }

    @PostMapping
    public EmployeeDTO addEmployee(@RequestBody CreateEmployeeRequest request) {
        return employeeService.addEmployee(request);
    }

    @PutMapping("/{id}")
    public EmployeeDTO updateEmployee(@PathVariable String id, @RequestBody CreateEmployeeRequest request) {
        return employeeService.updateEmployee(id, request);
    }

    @PatchMapping("/{id}/status")
    public EmployeeDTO toggleStatus(@PathVariable String id) {
        return employeeService.toggleEmployeeStatus(id);
    }
}
