package com.americano.coffeeshop.dto;

import com.americano.coffeeshop.model.Employee;
import lombok.Data;
import java.util.List;
import java.util.stream.Collectors;

@Data
public class EmployeeDTO {
    private String id;
    private String employeeId;
    private String username;
    private String name;
    private String role;
    private String pin; // Optional: Mask this if highly sensitive, potentially needed for simple auth
                        // check
    private String position;
    private String email;
    private String phone;
    private java.math.BigDecimal salary;
    private boolean active;

    public static EmployeeDTO fromEntity(Employee employee) {
        if (employee == null)
            return null;
        EmployeeDTO dto = new EmployeeDTO();
        dto.setId(employee.getId());
        dto.setEmployeeId(employee.getEmployeeId());
        dto.setUsername(employee.getUsername());
        dto.setName(employee.getName());
        dto.setRole(employee.getRole());
        dto.setPin(employee.getPin());
        dto.setPosition(employee.getPosition());
        dto.setEmail(employee.getEmail());
        dto.setPhone(employee.getPhone());
        dto.setSalary(employee.getSalary());
        // Treat null as true (active by default)
        dto.setActive(employee.getActive() == null || employee.getActive());
        return dto;
    }

    public static List<EmployeeDTO> fromEntities(List<Employee> employees) {
        return employees.stream().map(EmployeeDTO::fromEntity).collect(Collectors.toList());
    }
}
