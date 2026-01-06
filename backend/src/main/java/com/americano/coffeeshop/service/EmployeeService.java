package com.americano.coffeeshop.service;

import com.americano.coffeeshop.model.Employee;
import java.util.List;

public interface EmployeeService {
    List<Employee> getAllEmployees();

    Employee addEmployee(Employee employee);
}
