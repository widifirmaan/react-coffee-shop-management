package com.americano.coffeeshop.config;

import com.americano.coffeeshop.model.Menu;
import com.americano.coffeeshop.model.Ingredient;
import com.americano.coffeeshop.model.Employee;
import com.americano.coffeeshop.model.Category;
import com.americano.coffeeshop.repository.IngredientRepository;
import com.americano.coffeeshop.repository.EmployeeRepository;
import com.americano.coffeeshop.repository.MenuRepository;
import com.americano.coffeeshop.repository.CategoryRepository;
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
    private final CategoryRepository categoryRepository;
    private final org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        // Clear data for fresh seeding
        menuRepository.deleteAll();
        categoryRepository.deleteAll();
        ingredientRepository.deleteAll();
        employeeRepository.deleteAll();

        seedCategories();
        seedMenu();
        seedIngredients();
        seedEmployees();
        System.out.println("All Data Seeding Completed");
    }

    private void seedCategories() {
        if (categoryRepository.count() == 0) {
            String[] cats = { "Coffee", "Non-Coffee", "Tea", "Pastry", "Main Course", "Snack" };
            for (String catName : cats) {
                Category c = new Category();
                c.setName(catName);
                categoryRepository.save(c);
            }
            System.out.println("Category Seeding Completed");
        }
    }

    private void seedMenu() {
        if (menuRepository.count() == 0) {
            // Coffee
            saveMenu("Americano", "25000", "Coffee", "Classic double shot espresso with hot water.",
                    "https://images.unsplash.com/photo-1551033406-611cf9a28f67?w=500&q=80");
            saveMenu("Cafe Latte", "32000", "Coffee", "Espresso with steamed milk and a thin layer of foam.",
                    "https://images.unsplash.com/photo-1541167760496-162955ed8a9f?w=500&q=80");
            saveMenu("Cappuccino", "32000", "Coffee", "Perfect balance of espresso, steamed milk, and foam.",
                    "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=500&q=80");
            saveMenu("Caramel Macchiato", "38000", "Coffee", "Espresso with vanilla syrup, milk and caramel drizzle.",
                    "https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=500&q=80");

            // Non-Coffee
            saveMenu("Matcha Latte", "35000", "Non-Coffee", "Pure green tea matcha with creamy milk.",
                    "https://images.unsplash.com/photo-1515823064-d6e0c04616a7?w=500&q=80");
            saveMenu("Dark Chocolate", "35000", "Non-Coffee", "Rich Belgian chocolate with velvety milk.",
                    "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500&q=80");

            // Tea
            saveMenu("Earl Grey Tea", "22000", "Tea", "Classic black tea with bergamot orange aroma.",
                    "https://images.unsplash.com/photo-1594631252845-29fc4586c55c?w=500&q=80");
            saveMenu("Lychee Tea", "28000", "Tea", "Freshly brewed tea with lychee fruits and syrup.",
                    "https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=500&q=80");

            // Pastry
            saveMenu("Butter Croissant", "25000", "Pastry", "Flaky and buttery puff pastry.",
                    "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=500&q=80");
            saveMenu("Pain au Chocolat", "28000", "Pastry", "Sweet pastry with chocolate filling.",
                    "https://images.unsplash.com/photo-1530610476181-d83430b64dcd?w=500&q=80");

            // Main Course
            saveMenu("Nasi Goreng Special", "45000", "Main Course",
                    "Indonesian fried rice with egg, chicken and crackers.",
                    "https://images.unsplash.com/photo-1512058560366-cd2427ffaa64?w=500&q=80");
            saveMenu("Beef Burger", "55000", "Main Course", "Juicy beef patty with cheese and signature sauce.",
                    "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500&q=80");

            // Snack
            saveMenu("French Fries", "20000", "Snack", "Crispy golden potato fries with sea salt.",
                    "https://images.unsplash.com/photo-1573082833021-88130a8c28e9?w=500&q=80");
            saveMenu("Platter Box", "40000", "Snack", "A mix of chicken wings, nuggets, and fries.",
                    "https://images.unsplash.com/photo-1562967914-6c82c6ca25fe?w=500&q=80");

            System.out.println("Menu Data Seeding Completed");
        }
    }

    private void saveMenu(String name, String price, String category, String desc, String img) {
        Menu m = new Menu();
        m.setName(name);
        m.setPrice(new BigDecimal(price));
        m.setCategory(category);
        m.setDescription(desc);
        m.setImageUrl(img);
        m.setAvailable(true);
        menuRepository.save(m);
    }

    private void seedIngredients() {
        if (ingredientRepository.count() == 0) {
            saveIngredient("Espresso Beans", 10.0, "kg", 2.0);
            saveIngredient("Fresh Milk", 20.0, "liters", 5.0);
            saveIngredient("Burger Buns", 50.0, "pcs", 10.0);
            saveIngredient("Chicken Patty", 30.0, "pcs", 5.0);
            saveIngredient("Lychee Syrup", 5.0, "liters", 1.0);
            System.out.println("Ingredient Data Seeding Completed");
        }
    }

    private void saveIngredient(String name, double qty, String unit, double min) {
        Ingredient i = new Ingredient();
        i.setName(name);
        i.setQuantity(qty);
        i.setUnit(unit);
        i.setMinThreshold(min);
        ingredientRepository.save(i);
    }

    private void seedEmployees() {
        employeeRepository.deleteAll();

        Employee e1 = new Employee();
        e1.setName("John Manager");
        e1.setUsername("manager");
        e1.setPassword(passwordEncoder.encode("password"));
        e1.setRole("Manager");
        e1.setSalary(new BigDecimal("9000000"));
        employeeRepository.save(e1);

        Employee e2 = new Employee();
        e2.setName("Jane Barista");
        e2.setUsername("barista");
        e2.setPassword(passwordEncoder.encode("password"));
        e2.setRole("Barista");
        e2.setSalary(new BigDecimal("4500000"));
        employeeRepository.save(e2);

        System.out.println("Employee Data Seeding Completed");
    }
}
