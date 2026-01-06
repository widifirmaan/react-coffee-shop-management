package com.americano.coffeeshop.config;

import com.americano.coffeeshop.model.Menu;
import com.americano.coffeeshop.model.Ingredient;
import com.americano.coffeeshop.model.Employee;
import com.americano.coffeeshop.repository.IngredientRepository;
import com.americano.coffeeshop.repository.EmployeeRepository;
import com.americano.coffeeshop.repository.MenuRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataLoader implements CommandLineRunner {

    private final MenuRepository menuRepository;
    private final IngredientRepository ingredientRepository;
    private final EmployeeRepository employeeRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        seedMenu();
        seedIngredients();
        seedEmployees();
        System.out.println("All Data Seeding Completed");
    }

    private void seedMenu() {
        if (menuRepository.count() == 0) {
            Menu m1 = new Menu();
            m1.setName("Americano");
            m1.setPrice(new BigDecimal("25000"));
            m1.setCategory("Coffee");
            m1.setDescription("Classic double shot espresso with hot water.");
            m1.setAvailable(true);
            menuRepository.save(m1);

            Menu m2 = new Menu();
            m2.setName("Cafe Latte");
            m2.setPrice(new BigDecimal("32000"));
            m2.setCategory("Coffee");
            m2.setDescription("Espresso with steamed milk and a thin layer of foam.");
            m2.setAvailable(true);
            menuRepository.save(m2);

            Menu m3 = new Menu();
            m3.setName("Beef Burger");
            m3.setPrice(new BigDecimal("55000"));
            m3.setCategory("Food");
            m3.setDescription("Juicy beef patty with cheese and veggies.");
            m3.setAvailable(true);
            menuRepository.save(m3);

            System.out.println("Data Seeding Completed");
        }
    }

    private void seedIngredients() {
        if (ingredientRepository.count() == 0) {
            Ingredient i1 = new Ingredient();
            i1.setName("Espresso Beans");
            i1.setQuantity(5.0);
            i1.setUnit("kg");
            i1.setMinThreshold(2.0);
            ingredientRepository.save(i1);

            Ingredient i2 = new Ingredient();
            i2.setName("Fresh Milk");
            i2.setQuantity(10.0);
            i2.setUnit("liters");
            i2.setMinThreshold(3.0);
            ingredientRepository.save(i2);

            Ingredient i3 = new Ingredient();
            i3.setName("Burger Buns");
            i3.setQuantity(20.0);
            i3.setUnit("pcs");
            i3.setMinThreshold(10.0);
            ingredientRepository.save(i3);

            System.out.println("Ingredient Data Seeding Completed");
        }
    }

    private void seedEmployees() {
        if (employeeRepository.count() == 0) {
            Employee e1 = new Employee();
            e1.setName("John Doe");
            e1.setUsername("manager");
            e1.setPassword(passwordEncoder.encode("password"));
            e1.setRole("Manager");
            e1.setSalary(new BigDecimal("8000000"));
            List<Employee.Attendance> att1 = new ArrayList<>();
            Employee.Attendance a1 = new Employee.Attendance();
            a1.setDate(LocalDate.now().minusDays(1));
            a1.setPresent(true);
            a1.setNotes("On time");
            att1.add(a1);
            e1.setAttendanceRecord(att1);
            employeeRepository.save(e1);

            Employee e2 = new Employee();
            e2.setName("Jane Smith");
            e2.setUsername("barista");
            e2.setPassword(passwordEncoder.encode("password"));
            e2.setRole("Barista");
            e2.setSalary(new BigDecimal("4500000"));
            employeeRepository.save(e2);

            System.out.println("Employee Data Seeding Completed");
        }
    }
}
