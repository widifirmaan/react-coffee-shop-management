package com.americano.coffeeshop.service;

import com.americano.coffeeshop.dto.CreateEmployeeRequest;
import com.americano.coffeeshop.dto.EmployeeDTO;
import java.util.List;

public interface EmployeeService {
    List<EmployeeDTO> getAllEmployees();

    EmployeeDTO addEmployee(CreateEmployeeRequest request);

    EmployeeDTO updateEmployee(String id, CreateEmployeeRequest request);

    EmployeeDTO toggleEmployeeStatus(String id);
}
